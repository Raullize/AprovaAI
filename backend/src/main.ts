import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors();
  app.setGlobalPrefix('api');

  app.useStaticAssets(
    path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads'),
    {
      prefix: '/uploads/',
    },
  );

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
