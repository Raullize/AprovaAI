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
    .setDescription(
      'API REST do AprovaAI — plataforma de estudos gamificada.\n\n' +
        '**Autenticação:** a maioria dos endpoints requer um token JWT. ' +
        'Faça login em `POST /auth/login` e envie o token no header ' +
        '`Authorization: Bearer <token>`.\n\n' +
        '**Hierarquia de conteúdo:** Exame → Tópico → Simulado → Questão.\n' +
        '**Rotas de admin** (`/exams`, `/topics`, `/simulations`, `/questions`): ' +
        'CRUD administrativo.\n' +
        '**Rotas do aluno** (`/simulation-attempts/*`): execução de simulados.\n' +
        '**Papéis:** `STUDENT` (aluno) e `ADMIN` (administrador).',
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT-auth',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  const cleanedDoc = cleanupOpenApiDoc(document);
  SwaggerModule.setup('api/docs', app, cleanedDoc);

  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
