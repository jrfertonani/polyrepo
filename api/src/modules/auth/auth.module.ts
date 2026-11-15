import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { AuthController } from 'src/modules/auth/auth.controller';
import { AuthService } from 'src/modules/auth/auth.service';
import { FileModule } from 'src/modules/file/file.module';
import { UserModule } from 'src/modules/user/user.module';
import { PrismaModule } from 'src/prisma/prisma.module';
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }), // Configura o módulo JWT com a chave secreta definida no arquivo .env
    forwardRef(() => UserModule),
    PrismaModule,
    FileModule,
  ], //
  controllers: [AuthController],
  providers: [AuthGuard, AuthService],
  exports: [AuthService, AuthGuard, JwtModule],
})
export class AuthModule {}
