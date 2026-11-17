"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProfileDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_user_dto_1 = require("./create-user.dto");
class UpdateProfileDto extends (0, mapped_types_1.PartialType)((0, mapped_types_1.PickType)(create_user_dto_1.CreateUserDto, ['name', 'email'])) {
}
exports.UpdateProfileDto = UpdateProfileDto;
//# sourceMappingURL=update-profile.js.map