import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { AuthRegisterDTO } from 'src/modules/auth/dto/auth-register.dto';
import { UserService } from 'src/modules/user/user.service';
import { PrismaService } from 'src/prisma/prisma.service';
export declare class AuthService {
    private readonly jwtService;
    private readonly prisma;
    private readonly userService;
    private readonly audience;
    private readonly loginIssuer;
    private readonly forgetIssuer;
    constructor(jwtService: JwtService, prisma: PrismaService, userService: UserService);
    createToken(user: Pick<User, 'id' | 'name' | 'email'>): {
        accessToken: string;
    };
    checkToken(token: string): any;
    isValidToken(token: string): boolean;
    login(email: string, password: string): Promise<{
        accessToken: string;
    }>;
    forget(email: string): Promise<{
        resetToken?: string;
        success: boolean;
        message: string;
    }>;
    reset(password: string, token: string): Promise<{
        accessToken: string;
    }>;
    registe(data: AuthRegisterDTO): Promise<{
        accessToken: string;
    }>;
    changePassword(userId: number, currentPassword: string, newPassword: string): Promise<{
        success: boolean;
    }>;
}
