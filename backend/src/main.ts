import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';
import { DomainExceptionFilter } from './shared/filters/domain-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { cleanupOpenApiDoc } from 'nestjs-zod';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors();
  app.setGlobalPrefix('api');

  app.useStaticAssets(
    path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads'),
    {
      prefix: '/uploads/',
      index: false,
    },
  );

  app.useGlobalFilters(new DomainExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('AprovaAI API')
    .setDescription('AprovaAI REST API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  const cleanedDoc = cleanupOpenApiDoc(document);
  SwaggerModule.setup('api/docs', app, cleanedDoc);

  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
