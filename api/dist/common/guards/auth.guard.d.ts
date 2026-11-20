import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from 'src/modules/auth/auth.service';
import { UserService } from 'src/modules/user/user.service';
export declare class AuthGuard implements CanActivate {
    private readonly authService;
    private readonly userService;
    private readonly reflector;
    constructor(authService: AuthService, userService: UserService, reflector: Reflector);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
