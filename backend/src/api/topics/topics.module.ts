import { Module } from '@nestjs/common';
import { TopicsController } from './topics.controller';
import {
  FindAllTopicsUseCase,
  FindTopicsByExamIdUseCase,
  FindTopicByIdUseCase,
} from '../../application/content/use-cases/find-topics.use-case';
import { CreateTopicUseCase } from '../../application/content/use-cases/create-topic.use-case';
import { UpdateTopicUseCase } from '../../application/content/use-cases/update-topic.use-case';
import {
  DeleteTopicUseCase,
  ReorderTopicsUseCase,
} from '../../application/content/use-cases/reorder-delete-topics.use-case';
import { TopicRepository } from '../../domain/content/repositories/topic.repository';
import { PrismaTopicRepository } from '../../infrastructure/database/prisma/repositories/prisma-topic.repository';

@Module({
  controllers: [TopicsController],
  providers: [
    FindAllTopicsUseCase,
    FindTopicsByExamIdUseCase,
    FindTopicByIdUseCase,
    CreateTopicUseCase,
    UpdateTopicUseCase,
    DeleteTopicUseCase,
    ReorderTopicsUseCase,
    {
      provide: TopicRepository,
      useClass: PrismaTopicRepository,
    },
  ],
})
export class TopicsModule {}
