import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { LevelRepository } from '../../../domain/content/repositories/level.repository';

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
    await this.levelRepository.reorder(request.ids);
  }
}
