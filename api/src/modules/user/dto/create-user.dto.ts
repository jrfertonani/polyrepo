import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsStrongPassword,
  Min,
  min,
  MinLength,
  minLength,
} from 'class-validator';
import { Role } from 'src/shared/anums/role.enum';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  password: string;

  @IsOptional()
  @IsEnum(Role)
  role: number;
}
