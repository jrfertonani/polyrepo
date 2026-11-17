import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AuthRegisterDTO } from 'src/modules/auth/dto/auth-register.dto';
import { UserService } from 'src/modules/user/user.service';
import { PrismaService } from 'src/prisma/prisma.service';

interface ResetTokenPayload {
  id: number;
  version: string;
  sub: string;
  iss: string;
  aud: string;
}

@Injectable()
export class AuthService {
  private readonly audience = 'users';
  private readonly loginIssuer = 'login';
  private readonly forgetIssuer = 'forget';

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
  ) { }

  createToken(user: Pick<User, 'id' | 'name' | 'email'>) {
    return {
      accessToken: this.jwtService.sign(
        {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        {
          expiresIn: '7 days',
          subject: String(user.id),
          issuer: this.loginIssuer,
          audience: this.audience,
        },
      ),
    };
  }

  checkToken(token: string) {
    try {
      const data = this.jwtService.verify(token, {
        issuer: this.loginIssuer,
        audience: this.audience,
      });
      return data;
    } catch (e) {
      throw new BadRequestException(
        e instanceof Error ? e.message : 'Token inválido ou expirado.',
      );
    }
  }

  isValidToken(token: string) {
    try {
      this.checkToken(token);
      return true;
    } catch {
      return false;
    }
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: email.trim().toLowerCase(),
      },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    if (!(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    return this.createToken(user);
  }

  async forget(email: string) {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await this.prisma.user.findFirst({
      where: {
        email: normalizedEmail,
      },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
      },
    });

    // Não vaza se o e-mail existe ou não no sistema (previne User Enumeration)
    if (!user) {
      return {
        success: true,
        message: 'Se o e-mail estiver cadastrado, enviaremos as instruções.',
      };
    }

    // Assina JWT temporário exclusivo para recuperação (issuer: 'forget')
    // A claim `version` vincula o token à senha atual, tornando-o de uso único após o reset
    const resetToken = this.jwtService.sign(
      {
        id: user.id,
        version: user.password.slice(-12),
      },
      {
        expiresIn: '30m',
        subject: String(user.id),
        issuer: this.forgetIssuer,
        audience: this.audience,
      },
    );

    // TODO: Integrar MailerService / fila BullMQ para enviar `resetToken` ao e-mail do usuário.
    // Em ambiente de desenvolvimento, retorne o token apenas se NODE_ENV !== 'production'
    const isDev = process.env.NODE_ENV !== 'production';

    return {
      success: true,
      message: 'Se o e-mail estiver cadastrado, enviaremos as instruções.',
      ...(isDev ? { resetToken } : {}),
    };
  }

  async reset(password: string, token: string) {
    let payload: ResetTokenPayload;

    try {
      payload = this.jwtService.verify<ResetTokenPayload>(token, {
        issuer: this.forgetIssuer,
        audience: this.audience,
      });
    } catch {
      throw new BadRequestException(
        'Token de recuperação inválido ou expirado.',
      );
    }

    const userId = Number(payload.id ?? payload.sub);
    if (!userId || Number.isNaN(userId)) {
      throw new BadRequestException('Token de recuperação malformado.');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
      },
    });

    if (!existingUser) {
      throw new BadRequestException('Usuário não encontrado.');
    }

    // Garante que o token ainda não foi utilizado para alterar a senha anteriormente
    if (payload.version !== existingUser.password.slice(-12)) {
      throw new BadRequestException(
        'Este token de recuperação já foi utilizado.',
      );
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    // Já devolve um accessToken de sessão válido após a redefinição
    return this.createToken(updatedUser);
  }

  async registe(data: AuthRegisterDTO) {
    const user = await this.userService.create(data);
    return this.createToken(user);
  }

  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ) {
    if (currentPassword === newPassword) {
      throw new BadRequestException(
        'A nova senha deve ser diferente da senha atual.',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado.');
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('A senha atual está incorreta.');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { success: true };
  }
}
