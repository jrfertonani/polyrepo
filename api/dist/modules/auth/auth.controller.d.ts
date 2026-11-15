import { FileService } from './../file/file.service';
import { UserService } from './../user/user.service';
import { AuthService } from 'src/modules/auth/auth.service';
import { AuthForgetDTO } from 'src/modules/auth/dto/auth-forget.dto';
import { AuthLoginDTO } from 'src/modules/auth/dto/auth-login.dto';
import { AuthRegisterDTO } from 'src/modules/auth/dto/auth-register.dto';
import { AuthResetDTO } from 'src/modules/auth/dto/auth-reset.dto';
export declare class AuthController {
    private readonly userService;
    private readonly authService;
    private readonly fileService;
    constructor(userService: UserService, authService: AuthService, fileService: FileService);
    login({ email, password }: AuthLoginDTO): Promise<{
        accessToken: string;
    }>;
    register(body: AuthRegisterDTO): Promise<{
        accessToken: string;
    }>;
    forget({ email }: AuthForgetDTO): Promise<boolean>;
    reset({ password, token }: AuthResetDTO): Promise<{
        accessToken: string;
    }>;
    uploadPhoto(user: any, photo: Express.Multer.File): Promise<{
        success: boolean;
    }>;
    uploadFiles(user: any, files: Express.Multer.File[]): Promise<Express.Multer.File[]>;
    uploadFilesFields(user: any, files: {
        photo: Express.Multer.File[];
        document: Express.Multer.File[];
    }): Promise<{
        photo: Express.Multer.File[];
        document: Express.Multer.File[];
    }>;
    me(user: any): Promise<{
        user: any;
    }>;
}
