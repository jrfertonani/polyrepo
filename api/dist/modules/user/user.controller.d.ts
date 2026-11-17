import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';
import { UpdateUserRoleDto } from './dto/update-user-role';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    updateProfile(user: any, data: UpdateProfileDto): Promise<{
        name: string;
        email: string;
        role: number;
        photoUrl: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }>;
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
    update(id: number, data: UpdateUserDto): Promise<{
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
    updateRole(id: number, actor: any, data: UpdateUserRoleDto): Promise<{
        name: string;
        email: string;
        role: number;
        photoUrl: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }>;
}
