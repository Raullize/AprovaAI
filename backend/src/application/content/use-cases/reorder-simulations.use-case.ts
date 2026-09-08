import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { SimulationRepository } from '../../../domain/content/repositories/simulation.repository';
import { InvalidReorderError } from '../../../domain/content/errors/invalid-reorder.error';

export interface ReorderSimulationsRequest {
  ids: string[];
}

@Injectable()
export class ReorderSimulationsUseCase implements UseCase<
  ReorderSimulationsRequest,
  void
> {
  constructor(private readonly simulationRepository: SimulationRepository) {}

  async execute(request: ReorderSimulationsRequest): Promise<void> {
    if (request.ids.length === 0) return;

    const uniqueIds = new Set(request.ids);
    if (uniqueIds.size !== request.ids.length) {
      throw new InvalidReorderError(
        'Existem IDs duplicados na lista de reordenação.',
      );
    }

    const referenceSimulation = await this.simulationRepository.findById(
      request.ids[0],
    );
    if (!referenceSimulation) {
      throw new InvalidReorderError(
        `O simulado com ID ${request.ids[0]} não foi encontrado.`,
      );
    }

    const allSimulationsInScope = await this.simulationRepository.findByTopicId(
      referenceSimulation.topicId,
    );
    const scopeIds = allSimulationsInScope.map((l) => l.id);

    if (request.ids.length !== scopeIds.length) {
      throw new InvalidReorderError(
        'A lista de reordenação deve conter exatamente todos os simulados do tópico atual.',
      );
    }

    const isValid = request.ids.every((id) => scopeIds.includes(id));
    if (!isValid) {
      throw new InvalidReorderError(
        'Um ou mais IDs informados não pertencem a este tópico ou são inválidos.',
      );
    }

    await this.simulationRepository.reorder(request.ids);
  }
}
