import { forwardRef, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/adapters/pug.adapter.js';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './health/HealthModule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }), // Configura o módulo de configuração para ser global, permitindo que as variáveis de ambiente sejam acessíveis em todo o aplicativo
    ThrottlerModule.forRoot({
      throttlers: [
        // limita buscas executadas no sistema, para evitar ataques de força bruta, para fazer liberação informar aqui
        {
          ttl: 60000, // 60.000 ms (60 segundos)
          limit: 10, // limite de 10 requisições
        },
      ],
    }),
    forwardRef(() => UserModule),
    forwardRef(() => AuthModule),
    HealthModule,
    MailerModule.forRoot({
      // configura o módulo de envio de emails
      transport: {
        // configura o transporte de email usando SMTP
        host: 'smtp.ethereal.email', // site para teste de envio de email: ethereal.email
        port: 587,
        auth: {
          user: 'lolita.gleason89@ethereal.email',
          pass: 'TxXsu1rDTPEpcXaRz3',
        },
      },
      defaults: {
        from: '"No Reply" <noreply@example.com>', // endereço de email padrão para envio
      },
      template: {
        dir: __dirname + '/templates', // caminho para os templates de email
        adapter: new PugAdapter(), // or new HandlebarsAdapter() or new EjsAdapter()
        options: {
          strict: true,
        },
      },
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [UserModule],
})
export class AppModule { }
