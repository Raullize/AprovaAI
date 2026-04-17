import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { TopicRepository } from '../../../domain/content/repositories/topic.repository';

export interface ReorderTopicsRequest {
  ids: string[];
}

@Injectable()
export class ReorderTopicsUseCase implements UseCase<
  ReorderTopicsRequest,
  void
> {
  constructor(private readonly topicRepository: TopicRepository) {}

  async execute(request: ReorderTopicsRequest): Promise<void> {
    await this.topicRepository.reorder(request.ids);
  }
}
