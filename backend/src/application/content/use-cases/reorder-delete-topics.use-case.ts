import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { TopicRepository } from '../../../domain/content/repositories/topic.repository';
import { ReorderDto } from '../../../api/exams/dto/exam.dto';

@Injectable()
export class ReorderTopicsUseCase implements UseCase<ReorderDto, void> {
  constructor(private readonly topicRepository: TopicRepository) {}

  async execute(request: ReorderDto): Promise<void> {
    await this.topicRepository.reorder(request.ids);
  }
}

@Injectable()
export class DeleteTopicUseCase implements UseCase<string, void> {
  constructor(private readonly topicRepository: TopicRepository) {}

  async execute(id: string): Promise<void> {
    await this.topicRepository.delete(id);
  }
}
