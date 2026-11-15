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
const log_interceptor_1 = require("../../common/interceptors/log.interceptor");
const prisma_service_1 = require("../../prisma/prisma.service");
let UserService = class UserService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const salt = await bcrypt.genSalt();
        data.password = await bcrypt.hash(data.password, salt);
        const emailExists = await this.prisma.user.count({
            where: {
                email: data.email,
            },
        });
        if (emailExists > 0) {
            throw new common_1.ConflictException('Email já cadastrado.');
        }
        return await this.prisma.user.create({
            data,
        });
    }
    findAll() {
        return this.prisma.user.findMany();
    }
    async findOne(id) {
        await this.exist(id);
        return await this.prisma.user.findUnique({
            where: {
                id,
            },
        });
    }
    async update(id, data) {
        await this.exist(id);
        const salt = await bcrypt.genSalt();
        data.password = await bcrypt.hash(data.password, salt);
        return this.prisma.user.update({
            where: {
                id,
            },
            data,
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.user.delete({
            where: {
                id,
            },
        });
    }
    async exist(id) {
        if (!(await this.prisma.user.count({ where: { id } }))) {
            throw new common_1.NotFoundException(`User with id ${id} not found`);
        }
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    (0, common_1.UseInterceptors)(log_interceptor_1.LogInterceptor),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserService);
//# sourceMappingURL=user.service.js.map