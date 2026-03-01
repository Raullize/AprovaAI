import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ExamsModule } from './exams/exams.module';
import { TopicsModule } from './topics/topics.module';
import { LevelsModule } from './levels/levels.module';
import { QuestionsModule } from './questions/questions.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [PrismaModule, AuthModule, ExamsModule, TopicsModule, LevelsModule, QuestionsModule, UploadModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
