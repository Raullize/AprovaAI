import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { TopicRepository } from '../../../domain/content/repositories/topic.repository';
import { InvalidReorderError } from '../../../domain/content/errors/invalid-reorder.error';

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
    if (request.ids.length === 0) return;

    const uniqueIds = new Set(request.ids);
    if (uniqueIds.size !== request.ids.length) {
      throw new InvalidReorderError(
        'Existem IDs duplicados na lista de reordenação.',
      );
    }

    const referenceTopic = await this.topicRepository.findById(request.ids[0]);
    if (!referenceTopic) {
      throw new InvalidReorderError(
        `O tópico com ID ${request.ids[0]} não foi encontrado.`,
      );
    }

    const allTopicsInScope = await this.topicRepository.findByExamId(
      referenceTopic.examId,
    );
    const scopeIds = allTopicsInScope.map((t) => t.id);

    if (request.ids.length !== scopeIds.length) {
      throw new InvalidReorderError(
        'A lista de reordenação deve conter exatamente todos os tópicos do exame atual.',
      );
    }

    const isValid = request.ids.every((id) => scopeIds.includes(id));
    if (!isValid) {
      throw new InvalidReorderError(
        'Um ou mais IDs informados não pertencem a este exame ou são inválidos.',
      );
    }

    await this.topicRepository.reorder(request.ids);
  }
}
