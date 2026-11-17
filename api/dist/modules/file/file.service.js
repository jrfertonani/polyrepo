"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var FileService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileService = void 0;
const common_1 = require("@nestjs/common");
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
require("multer");
let FileService = FileService_1 = class FileService {
    constructor() {
        this.logger = new common_1.Logger(FileService_1.name);
        this.storageRoot = (0, node_path_1.resolve)(process.cwd(), 'storage');
    }
    async upload(file, filePath) {
        const directory = (0, node_path_1.dirname)(filePath);
        await (0, promises_1.mkdir)(directory, { recursive: true });
        await (0, promises_1.writeFile)(filePath, file.buffer);
    }
    async removeByPublicUrl(publicUrl) {
        if (!publicUrl) {
            return;
        }
        const relativePath = publicUrl.replace(/^\/?storage\/?/, '');
        const targetPath = (0, node_path_1.resolve)(this.storageRoot, relativePath);
        if (!targetPath.startsWith(`${this.storageRoot}${node_path_1.sep}`) &&
            targetPath !== this.storageRoot) {
            this.logger.warn(`Tentativa bloqueada de remoção fora de storage: ${publicUrl}`);
            return;
        }
        try {
            await (0, promises_1.unlink)(targetPath);
        }
        catch (error) {
            if (error?.code !== 'ENOENT') {
                this.logger.warn(`Falha ao remover arquivo antigo (${targetPath}): ${error?.message}`);
            }
        }
    }
};
exports.FileService = FileService;
exports.FileService = FileService = FileService_1 = __decorate([
    (0, common_1.Injectable)()
], FileService);
//# sourceMappingURL=file.service.js.map