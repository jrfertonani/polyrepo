import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UserService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: CreateUserDto): Promise<{
        name: string;
        email: string;
        role: number;
        photoUrl: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        name: string;
        email: string;
        role: number;
        photoUrl: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }[]>;
    findOne(id: number): Promise<{
        name: string;
        email: string;
        role: number;
        photoUrl: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }>;
    update(id: number, data: UpdateUserDto | UpdateProfileDto): Promise<{
        name: string;
        email: string;
        role: number;
        photoUrl: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }>;
    remove(id: number): Promise<{
        name: string;
        email: string;
        role: number;
        photoUrl: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }>;
    exist(id: number): Promise<void>;
    updatePhoto(id: number, photoUrl: string | null): Promise<{
        name: string;
        email: string;
        role: number;
        photoUrl: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }>;
    updateRole(targetUserId: number, actorUserId: number, { role }: UpdateUserDto): Promise<{
        name: string;
        email: string;
        role: number;
        photoUrl: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }>;
}
