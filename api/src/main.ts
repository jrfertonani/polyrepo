import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { LogInterceptor } from 'src/common/interceptors/log.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //app.setGlobalPrefix('/api/v1');
  // Validação e sanitização estrita de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableShutdownHooks();
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  }); // habilita o CORS para que o front-end consiga acessar a API

  app.useGlobalInterceptors(new LogInterceptor()); // GET /user/ 200 0 - 14ms -> ele olha o tempo de execução, não é importante
  // '0.0.0.0' permite conexões vindas do emulador ou rede Wi-Fi
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
