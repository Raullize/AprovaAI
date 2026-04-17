import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { TopicRepository } from '../../../domain/content/repositories/topic.repository';
import { Topic } from '../../../domain/content/entities/topic.entity';

@Injectable()
export class FindTopicsByExamIdUseCase implements UseCase<string, Topic[]> {
  constructor(private readonly topicRepository: TopicRepository) {}

  async execute(examId: string): Promise<Topic[]> {
    return this.topicRepository.findByExamId(examId);
  }
}
