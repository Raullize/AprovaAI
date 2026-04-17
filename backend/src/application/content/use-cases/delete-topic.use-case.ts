import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { TopicRepository } from '../../../domain/content/repositories/topic.repository';

@Injectable()
export class DeleteTopicUseCase implements UseCase<string, void> {
  constructor(private readonly topicRepository: TopicRepository) {}

  async execute(id: string): Promise<void> {
    await this.topicRepository.delete(id);
  }
}
