import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import { UserService } from 'src/modules/user/user.service';
import { AuthRegisterDTO } from 'src/modules/auth/dto/auth-register.dto';
export declare class AuthService {
    private readonly jwtService;
    private readonly prisma;
    private readonly userService;
    private audience;
    private issuer;
    constructor(jwtService: JwtService, prisma: PrismaService, userService: UserService);
    createToken(user: User): {
        accessToken: string;
    };
    checkToken(token: string): any;
    isValidToken(token: string): boolean;
    login(email: string, password: string): Promise<{
        accessToken: string;
    }>;
    forget(email: string): Promise<boolean>;
    reset(password: string, token: string): Promise<{
        accessToken: string;
    }>;
    registe(data: AuthRegisterDTO): Promise<{
        accessToken: string;
    }>;
}
