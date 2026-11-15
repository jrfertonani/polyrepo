import { FileService } from './../file/file.service';
import { UserService } from './../user/user.service';
import {
  Body,
  Controller,
  Post,
  Headers,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UploadedFiles,
  ParseFilePipe,
  FileTypeValidator,
  MaxFileSizeValidator,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { join, extname } from 'path';
import { User } from 'src/common/decorators/user.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { AuthService } from 'src/modules/auth/auth.service';
import { AuthForgetDTO } from 'src/modules/auth/dto/auth-forget.dto';
import { AuthLoginDTO } from 'src/modules/auth/dto/auth-login.dto';
import { AuthRegisterDTO } from 'src/modules/auth/dto/auth-register.dto';
import { AuthResetDTO } from 'src/modules/auth/dto/auth-reset.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly fileService: FileService,
  ) {}

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

  @UseInterceptors(FileInterceptor('file')) // interceptor to handle file upload
  @UseGuards(AuthGuard)
  @Post('photo') // usa o decorator @UploadedFile() com validações
  async uploadPhoto(
    @User() user,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|pdf)$/ }),
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 10 }),
        ],
      }),
    )
    photo: Express.Multer.File,
  ) {
    const path = join(
      __dirname,
      '..',
      '..',
      'storage',
      'photos',
      `photo-${user.id}.png`,
    );

    try {
      this.fileService.upload(photo, path);
    } catch (e) {
      throw new BadRequestException(e);
    }
    return { success: true };
  }

  @UseInterceptors(FilesInterceptor('files')) // interceptor to handle multiple file uploads 1
  @UseGuards(AuthGuard)
  @Post('files') // usa o decorator @UploadedFile()
  async uploadFiles(
    @User() user,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return files;
  }

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
  ) // interceptor to handle multiple file uploads 2
  @UseGuards(AuthGuard)
  @Post('files-dields') // usa o decorator @UploadedFile()
  async uploadFilesFields(
    @User() user,
    @UploadedFiles()
    files: { photo: Express.Multer.File[]; document: Express.Multer.File[] },
  ) {
    return files;
  }

  //test token
  @UseGuards(AuthGuard)
  @Post('me')
  async me(@User() user) {
    return { user };
  }
  // testar este
  // @UseGuards(AuthGuard) // 1. Garante autenticação primeiro
  // @UseInterceptors(FileInterceptor('file'))
  // @Post('photo')
  // async uploadPhoto(
  //   @User() user,
  //   @UploadedFile(
  //     new ParseFilePipe({
  //       validators: [
  //         new FileTypeValidator({ fileType: /(jpg|jpeg|png|pdf)$/ }),
  //         new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 10 }), // Max 10MB
  //       ],
  //     }),
  //   )
  //   photo: Express.Multer.File,
  // ) {
  //   // Pega a extensão original (.jpg, .png, .pdf, etc.)
  //   const fileExtension = extname(photo.originalname);

  //   const path = join(
  //     __dirname,
  //     '..',
  //     '..',
  //     'storage',
  //     'photos',
  //     `photo-${user.id}${fileExtension}`,
  //   );

  //   try {
  //     // Usa await para garantir a gravação e capturar exceções corretamente
  //     await this.fileService.upload(photo, path);
  //   } catch (e) {
  //     throw new BadRequestException(e);
  //   }

  //   return {
  //     success: true,
  //     file: {
  //       originalName: photo.originalname,
  //       mimeType: photo.mimetype,
  //       size: photo.size, // Retorna o tamanho em bytes
  //     },
  //   };
  // }
}
