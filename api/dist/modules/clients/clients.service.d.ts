import { PrismaService } from 'src/prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
export declare class ClientsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateClientDto): Promise<{
        name: string;
        email: string;
        role: number;
        cpf: string;
        phone: string;
        createdAt: Date;
        id: number;
    }>;
}
