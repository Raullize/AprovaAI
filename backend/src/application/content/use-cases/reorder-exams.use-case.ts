import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { ExamRepository } from '../../../domain/content/repositories/exam.repository';
import { InvalidReorderError } from '../../../domain/content/errors/invalid-reorder.error';

export interface ReorderExamsRequest {
  ids: string[];
}

@Injectable()
export class ReorderExamsUseCase implements UseCase<ReorderExamsRequest, void> {
  constructor(private readonly examRepository: ExamRepository) {}

  async execute(request: ReorderExamsRequest): Promise<void> {
    if (request.ids.length === 0) return;

    const uniqueIds = new Set(request.ids);
    if (uniqueIds.size !== request.ids.length) {
      throw new InvalidReorderError('Existem IDs duplicados na lista de reordenação.');
    }

    const allExams = await this.examRepository.findAll();
    const scopeIds = allExams.map((e) => e.id);

    if (request.ids.length !== scopeIds.length) {
      throw new InvalidReorderError('A lista de reordenação deve conter exatamente todos os exames cadastrados.');
    }

    const isValid = request.ids.every((id) => scopeIds.includes(id));
    if (!isValid) {
      throw new InvalidReorderError('Um ou mais IDs informados não existem ou são inválidos.');
    }

    await this.examRepository.reorder(request.ids);
  }
}
