import { CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthService } from 'src/modules/auth/auth.service';
import { UserService } from 'src/modules/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
export declare class AuthGuard implements CanActivate {
    private readonly jwtService;
    private readonly authService;
    private readonly userService;
    private readonly reflector;
    constructor(jwtService: JwtService, authService: AuthService, userService: UserService, reflector: Reflector);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
