import { Injectable, NotFoundException } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { TopicRepository } from '../../../domain/content/repositories/topic.repository';
import { Topic } from '../../../domain/content/entities/topic.entity';

@Injectable()
export class FindAllTopicsUseCase implements UseCase<void, Topic[]> {
  constructor(private readonly topicRepository: TopicRepository) {}

  async execute(): Promise<Topic[]> {
    return this.topicRepository.findAll();
  }
}

@Injectable()
export class FindTopicsByExamIdUseCase implements UseCase<string, Topic[]> {
  constructor(private readonly topicRepository: TopicRepository) {}

  async execute(examId: string): Promise<Topic[]> {
    return this.topicRepository.findByExamId(examId);
  }
}

@Injectable()
export class FindTopicByIdUseCase implements UseCase<string, Topic> {
  constructor(private readonly topicRepository: TopicRepository) {}

  async execute(idOrSlug: string): Promise<Topic> {
    let topic = await this.topicRepository.findById(idOrSlug);
    if (!topic) {
      topic = await this.topicRepository.findBySlug(idOrSlug);
    }
    if (!topic) {
      throw new NotFoundException(
        `Topic with ID or slug ${idOrSlug} not found`,
      );
    }
    return topic;
  }
}
