import { FileService } from './../file/file.service';
import { UserService } from './../user/user.service';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Patch,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { join } from 'path';
import { User } from 'src/common/decorators/user.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { AuthService } from 'src/modules/auth/auth.service';
import { AuthForgetDTO } from 'src/modules/auth/dto/auth-forget.dto';
import { AuthLoginDTO } from 'src/modules/auth/dto/auth-login.dto';
import { AuthRegisterDTO } from 'src/modules/auth/dto/auth-register.dto';
import { AuthResetDTO } from 'src/modules/auth/dto/auth-reset.dto';
import 'multer';
import { AuthChangePasswordDTO } from './dto/auth-change-password.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly fileService: FileService,
  ) { }

  @Post('login')
  async login(@Body() { email, password }: AuthLoginDTO) {
    return this.authService.login(email, password);
  }

  @Post('register')
  async register(@Body() body: AuthRegisterDTO) {
    return this.authService.registe(body);
  }

  @Post('forget')
  async forget(@Body() { email }: AuthForgetDTO) {
    return this.authService.forget(email);
  }

  @Post('reset')
  async reset(@Body() { password, token }: AuthResetDTO) {
    return this.authService.reset(password, token);
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Post('photo')
  async uploadPhoto(
    @User() user,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: /(jpg|jpeg|png)$/ }),
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 10 }), // 10MB
        ],
      }),
    )
    photo: Express.Multer.File,
  ) {
    const previousPhotoUrl: string | null = user.photoUrl ?? null;

    const fileName = `photo-${user.id}-${Date.now()}.jpg`;
    const filePath = join(process.cwd(), 'storage', 'photos', fileName);
    const photoUrl = `/storage/photos/${fileName}`;

    try {
      await this.fileService.upload(photo, filePath);
      const updatedUser = await this.userService.updatePhoto(user.id, photoUrl);

      if (previousPhotoUrl && previousPhotoUrl !== photoUrl) {
        await this.fileService.removeByPublicUrl(previousPhotoUrl);
      }

      return {
        success: true,
        photoUrl: updatedUser.photoUrl,
        user: updatedUser,
      };
    } catch (e) {
      throw new BadRequestException(
        e instanceof Error ? e.message : 'Erro ao salvar foto do usuário.',
      );
    }
  }

  @UseGuards(AuthGuard)
  @Delete('photo')
  async deletePhoto(@User() user) {
    const currentPhotoUrl: string | null = user.photoUrl ?? null;

    if (!currentPhotoUrl) {
      return {
        success: true,
        photoUrl: null,
        user,
      };
    }

    try {
      // 1. Limpa o campo photoUrl no PostgreSQL
      const updatedUser = await this.userService.updatePhoto(user.id, null);

      // 2. Remove o arquivo físico em storage/photos (ignora ENOENT automaticamente)
      await this.fileService.removeByPublicUrl(currentPhotoUrl);

      return {
        success: true,
        photoUrl: null,
        user: updatedUser,
      };
    } catch (e) {
      throw new BadRequestException(
        e instanceof Error ? e.message : 'Erro ao remover foto do usuário.',
      );
    }
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(FilesInterceptor('files'))
  @Post('files')
  async uploadFiles(
    @User() user,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return files;
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      {
        name: 'photo',
        maxCount: 1,
      },
      {
        name: 'document',
        maxCount: 10,
      },
    ]),
  )
  @Post('files-dields')
  async uploadFilesFields(
    @User() user,
    @UploadedFiles()
    files: { photo: Express.Multer.File[]; document: Express.Multer.File[] },
  ) {
    return files;
  }

  @UseGuards(AuthGuard)
  @Post('me')
  async me(@User() user) {
    return { user };
  }

  @UseGuards(AuthGuard)
  @Patch('password')
  async changePassword(
    @User() user,
    @Body() { currentPassword, newPassword }: AuthChangePasswordDTO,
  ) {
    return this.authService.changePassword(
      user.id,
      currentPassword,
      newPassword,
    );
  }
}
