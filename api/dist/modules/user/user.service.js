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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
const prisma_service_1 = require("../../prisma/prisma.service");
const role_enum_1 = require("../../shared/anums/role.enum");
const USER_SAFE_SELECT = {
    id: true,
    name: true,
    email: true,
    role: true,
    photoUrl: true,
    createdAt: true,
    updatedAt: true,
};
let UserService = class UserService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const emailExists = await this.prisma.user.count({
            where: { email: data.email },
        });
        if (emailExists > 0) {
            throw new common_1.ConflictException('Email já cadastrado.');
        }
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(data.password, salt);
        return this.prisma.user.create({
            data: {
                ...data,
                password: hashedPassword,
            },
            select: USER_SAFE_SELECT,
        });
    }
    findAll() {
        return this.prisma.user.findMany({
            select: USER_SAFE_SELECT,
        });
    }
    async findOne(id) {
        await this.exist(id);
        return this.prisma.user.findUnique({
            where: { id },
            select: USER_SAFE_SELECT,
        });
    }
    async update(id, data) {
        await this.exist(id);
        if (data.email) {
            const emailInUse = await this.prisma.user.findFirst({
                where: {
                    email: data.email,
                    NOT: { id },
                },
            });
            if (emailInUse) {
                throw new common_1.ConflictException('Este e-mail já está em uso por outro usuário.');
            }
        }
        const updateData = { ...data };
        if ('password' in updateData && updateData.password) {
            const salt = await bcrypt.genSalt();
            updateData.password = await bcrypt.hash(updateData.password, salt);
        }
        else {
            delete updateData.password;
        }
        return this.prisma.user.update({
            where: { id },
            data: updateData,
            select: USER_SAFE_SELECT,
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.user.delete({
            where: { id },
            select: USER_SAFE_SELECT,
        });
    }
    async exist(id) {
        if (!(await this.prisma.user.count({ where: { id } }))) {
            throw new common_1.NotFoundException(`User with id ${id} not found`);
        }
    }
    async updatePhoto(id, photoUrl) {
        return this.prisma.user.update({
            where: { id },
            data: { photoUrl },
            select: USER_SAFE_SELECT,
        });
    }
    async updateRole(targetUserId, actorUserId, { role }) {
        if (targetUserId === actorUserId && role !== role_enum_1.Role.Admin) {
            throw new common_1.BadRequestException('Você não pode remover sua própria permissão de Administradoe.');
        }
        await this.exist(targetUserId);
        return this.prisma.user.update({
            where: { id: targetUserId },
            data: { role },
            select: USER_SAFE_SELECT,
        });
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserService);
//# sourceMappingURL=user.service.js.map