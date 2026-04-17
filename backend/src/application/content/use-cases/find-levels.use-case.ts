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

  async execute(id: string): Promise<Level> {
    const level = await this.levelRepository.findById(id);
    if (!level) {
      throw new NotFoundException(`Level with ID ${id} not found`);
    }
    return level;
  }
}

@Injectable()
export class FindLevelBySlugUseCase implements UseCase<string, Level> {
  constructor(private readonly levelRepository: LevelRepository) {}

  async execute(slug: string): Promise<Level> {
    const level = await this.levelRepository.findBySlug(slug);
    if (!level) {
      throw new NotFoundException(`Level with slug ${slug} not found`);
    }
    return level;
  }
}
