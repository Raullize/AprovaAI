import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { LevelRepository } from '../../../domain/content/repositories/level.repository';
import { Level } from '../../../domain/content/entities/level.entity';
import { ResourceNotFoundError } from '../../../shared/core/errors/resource-not-found.error';

@Injectable()
export class FindLevelByIdOrSlugUseCase implements UseCase<string, Level> {
  constructor(private readonly levelRepository: LevelRepository) {}

  async execute(idOrSlug: string): Promise<Level> {
    const level =
      (await this.levelRepository.findById(idOrSlug)) ??
      (await this.levelRepository.findBySlug(idOrSlug));

    if (!level) {
      throw new ResourceNotFoundError('Level', idOrSlug);
    }

    return level;
  }
}
