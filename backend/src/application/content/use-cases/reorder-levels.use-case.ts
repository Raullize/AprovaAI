import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { LevelRepository } from '../../../domain/content/repositories/level.repository';
import { InvalidReorderError } from '../../../domain/content/errors/invalid-reorder.error';

export interface ReorderLevelsRequest {
  ids: string[];
}

@Injectable()
export class ReorderLevelsUseCase implements UseCase<
  ReorderLevelsRequest,
  void
> {
  constructor(private readonly levelRepository: LevelRepository) {}

  async execute(request: ReorderLevelsRequest): Promise<void> {
    if (request.ids.length === 0) return;

    const uniqueIds = new Set(request.ids);
    if (uniqueIds.size !== request.ids.length) {
      throw new InvalidReorderError('Existem IDs duplicados na lista de reordenação.');
    }

    const referenceLevel = await this.levelRepository.findById(request.ids[0]);
    if (!referenceLevel) {
      throw new InvalidReorderError(`O nível com ID ${request.ids[0]} não foi encontrado.`);
    }

    const allLevelsInScope = await this.levelRepository.findByTopicId(referenceLevel.topicId);
    const scopeIds = allLevelsInScope.map((l) => l.id);

    if (request.ids.length !== scopeIds.length) {
      throw new InvalidReorderError('A lista de reordenação deve conter exatamente todos os níveis do tópico atual.');
    }

    const isValid = request.ids.every((id) => scopeIds.includes(id));
    if (!isValid) {
      throw new InvalidReorderError('Um ou mais IDs informados não pertencem a este tópico ou são inválidos.');
    }

    await this.levelRepository.reorder(request.ids);
  }
}
