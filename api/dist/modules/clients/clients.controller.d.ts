import { CreateClientDto } from './dto/create-client.dto';
import { ClientsService } from './clients.service';
export declare class ClientsController {
    private readonly clientsService;
    constructor(clientsService: ClientsService);
    create(createClientDto: CreateClientDto): Promise<{
        name: string;
        email: string;
        role: number;
        cpf: string;
        phone: string;
        createdAt: Date;
        id: number;
    }>;
}
