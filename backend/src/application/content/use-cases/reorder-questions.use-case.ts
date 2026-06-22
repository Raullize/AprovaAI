import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { QuestionRepository } from '../../../domain/content/repositories/question.repository';
import { InvalidReorderError } from '../../../domain/content/errors/invalid-reorder.error';

export interface ReorderQuestionsRequest {
  ids: string[];
}

@Injectable()
export class ReorderQuestionsUseCase implements UseCase<
  ReorderQuestionsRequest,
  void
> {
  constructor(private readonly questionRepository: QuestionRepository) {}

  async execute(request: ReorderQuestionsRequest): Promise<void> {
    if (request.ids.length === 0) return;

    const uniqueIds = new Set(request.ids);
    if (uniqueIds.size !== request.ids.length) {
      throw new InvalidReorderError('Existem IDs duplicados na lista de reordenação.');
    }

    const referenceQuestion = await this.questionRepository.findById(request.ids[0]);
    if (!referenceQuestion) {
      throw new InvalidReorderError(`A questão com ID ${request.ids[0]} não foi encontrada.`);
    }

    const allQuestionsInScope = await this.questionRepository.findByLevelId(referenceQuestion.levelId);
    const scopeIds = allQuestionsInScope.map((q) => q.id);

    if (request.ids.length !== scopeIds.length) {
      throw new InvalidReorderError('A lista de reordenação deve conter exatamente todas as questões do nível atual.');
    }

    const isValid = request.ids.every((id) => scopeIds.includes(id));
    if (!isValid) {
      throw new InvalidReorderError('Um ou mais IDs informados não pertencem a este nível ou são inválidos.');
    }

    await this.questionRepository.reorder(request.ids);
  }
}
