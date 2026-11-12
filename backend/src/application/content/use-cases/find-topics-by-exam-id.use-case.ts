import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { TopicRepository } from '../../../domain/content/repositories/topic.repository';
import { Topic } from '../../../domain/content/entities/topic.entity';
import { ContentReadOptions } from './content-read-options';

@Injectable()
export class FindTopicsByExamIdUseCase implements UseCase<
  { examId: string; options?: ContentReadOptions },
  Topic[]
> {
  constructor(private readonly topicRepository: TopicRepository) {}

  async execute({
    examId,
    options = {},
  }: {
    examId: string;
    options?: ContentReadOptions;
  }): Promise<Topic[]> {
    const { includeDraft = false } = options;
    const topics = await this.topicRepository.findByExamId(examId);
    return includeDraft
      ? topics
      : topics.filter((t) => t.status === 'PUBLISHED');
  }
}
