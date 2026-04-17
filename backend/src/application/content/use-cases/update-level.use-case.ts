import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { LevelRepository } from '../../../domain/content/repositories/level.repository';
import { Level } from '../../../domain/content/entities/level.entity';
import { Slug } from '../../../domain/content/value-objects/slug';
import { generateUniqueSlug } from '../../../shared/utils/slugify';
import { ResourceNotFoundError } from '../../../shared/core/errors/resource-not-found.error';

export interface UpdateLevelRequest {
  id: string;
  data: {
    name?: string;
    description?: string;
    status?: 'ACTIVE' | 'INACTIVE';
    topicId?: string;
    xpReward?: number;
    passingPercentage?: number;
  };
}

@Injectable()
export class UpdateLevelUseCase implements UseCase<UpdateLevelRequest, Level> {
  constructor(private readonly levelRepository: LevelRepository) {}

  async execute(request: UpdateLevelRequest): Promise<Level> {
    const level: Level | null = await this.levelRepository.findById(request.id);

    if (!level) {
      throw new ResourceNotFoundError('Level', request.id);
    }

    if (request.data.name && request.data.name !== level.name) {
      const slug = await generateUniqueSlug(
        request.data.name,
        async (testSlug: string) => {
          const existing = await this.levelRepository.findBySlugAndTopicId(
            testSlug,
            level.topicId,
          );
          return existing ? existing.id !== request.id : false;
        },
      );

      level.updateDetails(
        request.data.name,
        request.data.description ?? level.description,
        Slug.create(slug),
        request.data.topicId ?? level.topicId,
        request.data.xpReward ?? level.xpReward,
        request.data.passingPercentage ?? level.passingPercentage,
      );
    } else if (
      request.data.description !== undefined ||
      request.data.topicId !== undefined ||
      request.data.xpReward !== undefined ||
      request.data.passingPercentage !== undefined
    ) {
      level.updateDetails(
        level.name,
        request.data.description ?? level.description,
        level.slug,
        request.data.topicId ?? level.topicId,
        request.data.xpReward ?? level.xpReward,
        request.data.passingPercentage ?? level.passingPercentage,
      );
    }

    if (request.data.status !== undefined) {
      if (request.data.status === 'ACTIVE') {
        level.activate();
      } else {
        level.deactivate();
      }
    }

    return this.levelRepository.save(level);
  }
}
