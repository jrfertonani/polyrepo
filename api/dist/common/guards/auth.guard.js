"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const auth_service_1 = require("../../modules/auth/auth.service");
const user_service_1 = require("../../modules/user/user.service");
const roles_decorator_1 = require("../decorators/roles.decorator");
let AuthGuard = class AuthGuard {
    constructor(authService, userService, reflector) {
        this.authService = authService;
        this.userService = userService;
        this.reflector = reflector;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const { authorization } = request.headers;
        if (!authorization || !authorization.startsWith('Bearer ')) {
            throw new common_1.UnauthorizedException('Token não fornecido ou mal formatado.');
        }
        const token = authorization.split(' ')[1];
        let data;
        try {
            data = this.authService.checkToken(token);
            request.tokenPayLoad = data;
        }
        catch (e) {
            throw new common_1.UnauthorizedException('Token inválido ou expirado.');
        }
        const user = await this.userService.findOne(data.id);
        if (!user) {
            throw new common_1.UnauthorizedException('Usuário não encontrado.');
        }
        request.user = user;
        const requiredRoles = this.reflector.getAllAndOverride(roles_decorator_1.ROLES_KEY, [context.getHandler(), context.getClass()]);
        if (requiredRoles && !requiredRoles.includes(user.role)) {
            throw new common_1.ForbiddenException('Acesso restrito a administradores.');
        }
        return true;
    }
};
exports.AuthGuard = AuthGuard;
exports.AuthGuard = AuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        user_service_1.UserService,
        core_1.Reflector])
], AuthGuard);
//# sourceMappingURL=auth.guard.js.map