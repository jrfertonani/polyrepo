import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateClientDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome é obrigatório.' })
  name: string;

  @Transform(({ value }) => value?.replace(/\D/g, ''))
  @IsString()
  @Length(11, 11, { message: 'O CPF deve conter exatamente 11 dígitos.' })
  @Matches(/^\d{11}$/, { message: 'CPF inválido.' })
  cpf: string;

  @IsOptional()
  @IsEmail({}, { message: 'E-mail inválido.' })
  email?: string;

  @IsOptional()
  @Transform(({ value }) => value?.replace(/\D/g, ''))
  @IsString()
  phone?: string;
}
