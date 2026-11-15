import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Ajuste o caminho conforme sua estrutura

@Controller('health')
export class HealthController {
    constructor(private readonly prisma: PrismaService) { }

    @Get()
    async check() {
        try {
            await this.prisma.$queryRaw`SELECT 1`;

            return {
                status: 'ok',
                database: 'connected',
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            throw new ServiceUnavailableException({
                status: 'error',
                database: 'disconnected',
                timestamp: new Date().toISOString(),
            });
        }
    }
}