import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { LevelRepository } from '../../../domain/content/repositories/level.repository';

@Injectable()
export class DeleteLevelUseCase implements UseCase<string, void> {
  constructor(private readonly levelRepository: LevelRepository) {}

  async execute(id: string): Promise<void> {
    await this.levelRepository.delete(id);
  }
}
