import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { LevelRepository } from '../../../domain/content/repositories/level.repository';
import { ReorderDto } from '../../../api/exams/dto/exam.dto';

@Injectable()
export class ReorderLevelsUseCase implements UseCase<ReorderDto, void> {
  constructor(private readonly levelRepository: LevelRepository) {}

  async execute(request: ReorderDto): Promise<void> {
    await this.levelRepository.reorder(request.ids);
  }
}

@Injectable()
export class DeleteLevelUseCase implements UseCase<string, void> {
  constructor(private readonly levelRepository: LevelRepository) {}

  async execute(id: string): Promise<void> {
    await this.levelRepository.delete(id);
  }
}
