import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateClientDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ cpf: dto.cpf }, ...(dto.email ? [{ email: dto.email }] : [])],
      },
      select: { id: true, cpf: true, email: true },
    });

    if (existingUser) {
      if (existingUser.cpf === dto.cpf) {
        throw new ConflictException('Já existe um cadastro com este CPF.');
      }
      throw new ConflictException('Já existe um cadastro com este e-mail.');
    }

    return this.prisma.user.create({
      data: {
        name: dto.name,
        cpf: dto.cpf,
        email: dto.email,
        phone: dto.phone,
        role: 1,
        password: null,
      },
      select: {
        id: true,
        name: true,
        cpf: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });
  }
}
