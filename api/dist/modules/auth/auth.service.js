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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const user_service_1 = require("../user/user.service");
const prisma_service_1 = require("../../prisma/prisma.service");
let AuthService = class AuthService {
    constructor(jwtService, prisma, userService) {
        this.jwtService = jwtService;
        this.prisma = prisma;
        this.userService = userService;
        this.audience = 'users';
        this.loginIssuer = 'login';
        this.forgetIssuer = 'forget';
    }
    createToken(user) {
        return {
            accessToken: this.jwtService.sign({
                id: user.id,
                name: user.name,
                email: user.email,
            }, {
                expiresIn: '7 days',
                subject: String(user.id),
                issuer: this.loginIssuer,
                audience: this.audience,
            }),
        };
    }
    checkToken(token) {
        try {
            const data = this.jwtService.verify(token, {
                issuer: this.loginIssuer,
                audience: this.audience,
            });
            return data;
        }
        catch (e) {
            throw new common_1.BadRequestException(e instanceof Error ? e.message : 'Token inválido ou expirado.');
        }
    }
    isValidToken(token) {
        try {
            this.checkToken(token);
            return true;
        }
        catch {
            return false;
        }
    }
    async login(email, password) {
        const user = await this.prisma.user.findFirst({
            where: {
                email: email.trim().toLowerCase(),
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Credenciais inválidas.');
        }
        if (!(await bcrypt.compare(password, user.password))) {
            throw new common_1.UnauthorizedException('Credenciais inválidas.');
        }
        return this.createToken(user);
    }
    async forget(email) {
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
        if (!user) {
            return {
                success: true,
                message: 'Se o e-mail estiver cadastrado, enviaremos as instruções.',
            };
        }
        const resetToken = this.jwtService.sign({
            id: user.id,
            version: user.password.slice(-12),
        }, {
            expiresIn: '30m',
            subject: String(user.id),
            issuer: this.forgetIssuer,
            audience: this.audience,
        });
        const isDev = process.env.NODE_ENV !== 'production';
        return {
            success: true,
            message: 'Se o e-mail estiver cadastrado, enviaremos as instruções.',
            ...(isDev ? { resetToken } : {}),
        };
    }
    async reset(password, token) {
        let payload;
        try {
            payload = this.jwtService.verify(token, {
                issuer: this.forgetIssuer,
                audience: this.audience,
            });
        }
        catch {
            throw new common_1.BadRequestException('Token de recuperação inválido ou expirado.');
        }
        const userId = Number(payload.id ?? payload.sub);
        if (!userId || Number.isNaN(userId)) {
            throw new common_1.BadRequestException('Token de recuperação malformado.');
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
            throw new common_1.BadRequestException('Usuário não encontrado.');
        }
        if (payload.version !== existingUser.password.slice(-12)) {
            throw new common_1.BadRequestException('Este token de recuperação já foi utilizado.');
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
        return this.createToken(updatedUser);
    }
    async registe(data) {
        const user = await this.userService.create(data);
        return this.createToken(user);
    }
    async changePassword(userId, currentPassword, newPassword) {
        if (currentPassword === newPassword) {
            throw new common_1.BadRequestException('A nova senha deve ser diferente da senha atual.');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, password: true },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Usuário não encontrado.');
        }
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('A senha atual está incorreta.');
        }
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        await this.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
        return { success: true };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        prisma_service_1.PrismaService,
        user_service_1.UserService])
], AuthService);
//# sourceMappingURL=auth.service.js.map