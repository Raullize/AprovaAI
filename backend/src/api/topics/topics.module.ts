import { Module } from '@nestjs/common';
import { TopicsController } from './topics.controller';
import { FindAllTopicsUseCase } from '../../application/content/use-cases/find-all-topics.use-case';
import { FindTopicsByExamIdUseCase } from '../../application/content/use-cases/find-topics-by-exam-id.use-case';
import { FindTopicByIdUseCase } from '../../application/content/use-cases/find-topic-by-id.use-case';
import { FindTopicBySlugUseCase } from '../../application/content/use-cases/find-topic-by-slug.use-case';
import { CreateTopicUseCase } from '../../application/content/use-cases/create-topic.use-case';
import { UpdateTopicUseCase } from '../../application/content/use-cases/update-topic.use-case';
import { DeleteTopicUseCase } from '../../application/content/use-cases/delete-topic.use-case';
import { ReorderTopicsUseCase } from '../../application/content/use-cases/reorder-topics.use-case';
import { TopicRepository } from '../../domain/content/repositories/topic.repository';
import { PrismaTopicRepository } from '../../infrastructure/database/prisma/repositories/prisma-topic.repository';

@Module({
  controllers: [TopicsController],
  providers: [
    FindAllTopicsUseCase,
    FindTopicsByExamIdUseCase,
    FindTopicByIdUseCase,
    FindTopicBySlugUseCase,
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
