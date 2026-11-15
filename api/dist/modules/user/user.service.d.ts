import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
export declare class UserService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: CreateUserDto): Promise<{
        name: string;
        email: string;
        password: string;
        role: number;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        name: string;
        email: string;
        password: string;
        role: number;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }[]>;
    findOne(id: number): Promise<{
        name: string;
        email: string;
        password: string;
        role: number;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }>;
    update(id: number, data: UpdateUserDto): Promise<{
        name: string;
        email: string;
        password: string;
        role: number;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }>;
    remove(id: number): Promise<{
        name: string;
        email: string;
        password: string;
        role: number;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }>;
    exist(id: number): Promise<void>;
}
