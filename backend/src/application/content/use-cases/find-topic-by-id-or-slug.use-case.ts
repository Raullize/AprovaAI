import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { TopicRepository } from '../../../domain/content/repositories/topic.repository';
import { Topic } from '../../../domain/content/entities/topic.entity';
import { ResourceNotFoundError } from '../../../shared/core/errors/resource-not-found.error';
import { ContentReadOptions } from './content-read-options';

@Injectable()
export class FindTopicByIdOrSlugUseCase implements UseCase<
  { idOrSlug: string; options?: ContentReadOptions },
  Topic
> {
  constructor(private readonly topicRepository: TopicRepository) {}

  async execute({
    idOrSlug,
    options = {},
  }: {
    idOrSlug: string;
    options?: ContentReadOptions;
  }): Promise<Topic> {
    const { includeDraft = false } = options;
    const topic =
      (await this.topicRepository.findById(idOrSlug)) ??
      (await this.topicRepository.findBySlug(idOrSlug));

    if (!topic || (!includeDraft && topic.status !== 'PUBLISHED')) {
      throw new ResourceNotFoundError('Topic', idOrSlug);
    }

    return topic;
  }
}
