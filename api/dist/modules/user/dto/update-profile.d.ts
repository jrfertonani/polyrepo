import { CreateUserDto } from './create-user.dto';
declare const UpdateProfileDto_base: import("@nestjs/mapped-types").MappedType<Partial<Pick<CreateUserDto, "name" | "email">>>;
export declare class UpdateProfileDto extends UpdateProfileDto_base {
}
export {};
