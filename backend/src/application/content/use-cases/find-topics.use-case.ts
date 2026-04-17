import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { TopicRepository } from '../../../domain/content/repositories/topic.repository';
import { Topic } from '../../../domain/content/entities/topic.entity';
import { ResourceNotFoundError } from '../../../shared/core/errors/resource-not-found.error';

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

  async execute(id: string): Promise<Topic> {
    const topic = await this.topicRepository.findById(id);
    if (!topic) {
      throw new ResourceNotFoundError('Topic', id);
    }
    return topic;
  }
}

@Injectable()
export class FindTopicBySlugUseCase implements UseCase<string, Topic> {
  constructor(private readonly topicRepository: TopicRepository) {}

  async execute(slug: string): Promise<Topic> {
    const topic = await this.topicRepository.findBySlug(slug);
    if (!topic) {
      throw new ResourceNotFoundError('Topic (slug)', slug);
    }
    return topic;
  }
}
