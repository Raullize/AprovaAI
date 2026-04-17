import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { TopicRepository } from '../../../domain/content/repositories/topic.repository';
import { Topic } from '../../../domain/content/entities/topic.entity';
import { ResourceNotFoundError } from '../../../shared/core/errors/resource-not-found.error';

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
