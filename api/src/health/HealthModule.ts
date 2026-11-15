import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module'; // Remova se PrismaModule for @Global()
import { HealthController } from './HealthController';

@Module({
    imports: [PrismaModule],
    controllers: [HealthController],
})
export class HealthModule { }