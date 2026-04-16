import { Injectable, NotFoundException } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { LevelRepository } from '../../../domain/content/repositories/level.repository';
import { Level } from '../../../domain/content/entities/level.entity';

@Injectable()
export class FindAllLevelsUseCase implements UseCase<void, Level[]> {
  constructor(private readonly levelRepository: LevelRepository) {}

  async execute(): Promise<Level[]> {
    return this.levelRepository.findAll();
  }
}

@Injectable()
export class FindLevelsByTopicIdUseCase implements UseCase<string, Level[]> {
  constructor(private readonly levelRepository: LevelRepository) {}

  async execute(topicId: string): Promise<Level[]> {
    return this.levelRepository.findByTopicId(topicId);
  }
}

@Injectable()
export class FindLevelByIdUseCase implements UseCase<string, Level> {
  constructor(private readonly levelRepository: LevelRepository) {}

  async execute(idOrSlug: string): Promise<Level> {
    let level = await this.levelRepository.findById(idOrSlug);
    if (!level) {
      level = await this.levelRepository.findBySlug(idOrSlug);
    }
    if (!level) {
      throw new NotFoundException(
        `Level with ID or slug ${idOrSlug} not found`,
      );
    }
    return level;
  }
}
