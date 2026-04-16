import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './api/auth/auth.module';
import { ExamsModule } from './api/exams/exams.module';
import { TopicsModule } from './api/topics/topics.module';
import { LevelsModule } from './api/levels/levels.module';
import { QuestionsModule } from './api/questions/questions.module';
import { UploadModule } from './api/upload/upload.module';
import { HealthModule } from './api/health/health.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ExamsModule,
    TopicsModule,
    LevelsModule,
    QuestionsModule,
    UploadModule,
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
