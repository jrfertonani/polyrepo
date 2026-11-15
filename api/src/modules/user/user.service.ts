import {
  ConflictException,
  Injectable,
  NotFoundException,
  UseInterceptors,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { dematerialize } from 'rxjs';
import * as bcrypt from 'bcrypt';
import { LogInterceptor } from 'src/common/interceptors/log.interceptor';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
@UseInterceptors(LogInterceptor) //interceptor para medir os logs as requisições
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserDto) {
    const salt = await bcrypt.genSalt(); // declara a biblioteca bcrypt para gerar um salt

    data.password = await bcrypt.hash(data.password, salt); // declara a biblioteca bcrypt para indicar que o password que esta dentro do data sera criptografado e salva novamente no DB no lugar do password, onde indica data.password

    const emailExists = await this.prisma.user.count({
      where: {
        email: data.email,
      },
    });

    if (emailExists > 0) {
      throw new ConflictException('Email já cadastrado.');
    }

    return await this.prisma.user.create({
      data,
    });
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(id: number) {
    await this.exist(id);
    return await this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async update(id: number, data: UpdateUserDto) {
    await this.exist(id);

    const salt = await bcrypt.genSalt();

    data.password = await bcrypt.hash(data.password, salt);

    return this.prisma.user.update({
      where: {
        id,
      },
      data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.user.delete({
      where: {
        id,
      },
    });
  }

  async exist(id: number) {
    if (!(await this.prisma.user.count({ where: { id } }))) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }
}
