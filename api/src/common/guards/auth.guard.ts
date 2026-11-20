import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from 'src/modules/auth/auth.service';
import { UserService } from 'src/modules/user/user.service';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { authorization } = request.headers;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token não fornecido ou mal formatado.');
    }

    const token = authorization.split(' ')[1];

    let data: any;
    try {
      data = this.authService.checkToken(token);
      request.tokenPayLoad = data;
    } catch (e) {
      throw new UnauthorizedException('Token inválido ou expirado.');
    }

    const user = await this.userService.findOne(data.id);
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado.');
    }

    request.user = user;

    // Verifica se a rota exige roles específicas (ex: @Roles(2))
    const requiredRoles = this.reflector.getAllAndOverride<number[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (requiredRoles && !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Acesso restrito a administradores.');
    }

    return true;
  }
}
