import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/common/decorators/roles.decorator';
import { User } from 'src/common/decorators/user.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { PositiveIntPipe } from 'src/common/pipes/positive-int.pipe';
import { Role } from 'src/shared/anums/role.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';
import { UpdateUserRoleDto } from './dto/update-user-role';

@UseGuards(AuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  // Rota literal declarada ANTES das rotas parametrizadas (:id)
  @Patch('me')
  updateProfile(@User() user, @Body() data: UpdateProfileDto) {
    return this.userService.update(user.id, data);
  }

  @Roles(Role.Admin)
  @UseGuards(RoleGuard)
  @Post()
  create(@Body() data: CreateUserDto) {
    return this.userService.create(data);
  }

  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RoleGuard)
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Roles(Role.Admin)
  @UseGuards(RoleGuard)
  @Get(':id')
  findOne(@Param('id', PositiveIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Roles(Role.Admin)
  @UseGuards(RoleGuard)
  @Patch(':id')
  update(
    @Param('id', PositiveIntPipe) id: number,
    @Body() data: UpdateUserDto,
  ) {
    return this.userService.update(id, data);
  }

  @Roles(Role.Admin)
  @UseGuards(RoleGuard)
  @Delete(':id')
  remove(@Param('id', PositiveIntPipe) id: number) {
    return this.userService.remove(id);
  }

  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RoleGuard)
  @Patch(':id/role')
  updateRole(
    @Param('id', PositiveIntPipe) id: number,
    @User() actor,
    @Body() data: UpdateUserRoleDto,
  ) {
    return this.userService.updateRole(id, actor.id, data);
  }
}
