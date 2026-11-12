import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { TopicRepository } from '../../../domain/content/repositories/topic.repository';
import { Topic } from '../../../domain/content/entities/topic.entity';
import { ContentReadOptions } from './content-read-options';

@Injectable()
export class FindAllTopicsUseCase implements UseCase<
  ContentReadOptions,
  Topic[]
> {
  constructor(private readonly topicRepository: TopicRepository) {}

  async execute(options: ContentReadOptions = {}): Promise<Topic[]> {
    const { includeDraft = false } = options;
    const topics = await this.topicRepository.findAll();
    return includeDraft
      ? topics
      : topics.filter((t) => t.status === 'PUBLISHED');
  }
}
