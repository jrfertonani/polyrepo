import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from 'src/shared/enums/role.enum';

export const USER_SAFE_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  photoUrl: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserDto) {
    const emailExists = await this.prisma.user.count({
      where: { email: data.email },
    });

    if (emailExists > 0) {
      throw new ConflictException('Email já cadastrado.');
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

  async findAll() {
    return this.prisma.user.findMany({
      select: USER_SAFE_SELECT,
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: number) {
    await this.exist(id);
    return this.prisma.user.findUnique({
      where: { id },
      select: USER_SAFE_SELECT,
    });
  }

  async update(id: number, data: UpdateUserDto | UpdateProfileDto) {
    await this.exist(id);

    if (data.email) {
      const emailInUse = await this.prisma.user.findFirst({
        where: {
          email: data.email,
          NOT: { id },
        },
      });

      if (emailInUse) {
        throw new ConflictException(
          'Este e-mail já está em uso por outro usuário.',
        );
      }
    }

    const updateData: Partial<UpdateUserDto> = { ...data };

    // Só aplica hash se a senha foi enviada na requisição PATCH
    if ('password' in updateData && updateData.password) {
      const salt = await bcrypt.genSalt();
      updateData.password = await bcrypt.hash(updateData.password, salt);
    } else {
      delete updateData.password;
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: USER_SAFE_SELECT,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.user.delete({
      where: { id },
      select: USER_SAFE_SELECT,
    });
  }

  async exist(id: number) {
    if (!(await this.prisma.user.count({ where: { id } }))) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }

  async updatePhoto(id: number, photoUrl: string | null) {
    return this.prisma.user.update({
      where: { id },
      data: { photoUrl },
      select: USER_SAFE_SELECT,
    });
  }

  async updateRole(
    targetUserId: number,
    actorUserId: number,
    { role }: UpdateUserDto,
  ) {
    if (targetUserId === actorUserId && role !== Role.Admin) {
      throw new BadRequestException(
        'Você não pode remover sua própria permissão de Administradoe.',
      );
    }

    await this.exist(targetUserId);

    return this.prisma.user.update({
      where: { id: targetUserId },
      data: { role },
      select: USER_SAFE_SELECT,
    });
  }
}
