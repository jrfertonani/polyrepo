import { IsEnum } from 'class-validator';
import { Role } from 'src/shared/enums/role.enum';

export class UpdateUserRoleDto {
  @IsEnum(Role, {
    message: 'Permissão inválida. Informe um valor válido do enum Role.',
  })
  role: Role;
}
