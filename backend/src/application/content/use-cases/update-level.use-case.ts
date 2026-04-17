import { Injectable, NotFoundException } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { LevelRepository } from '../../../domain/content/repositories/level.repository';
import { Level } from '../../../domain/content/entities/level.entity';
import { generateUniqueSlug } from '../../../shared/utils/slugify';

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
    const level = await this.levelRepository.findById(request.id);

    if (!level) {
      throw new NotFoundException(`Level with ID ${request.id} not found`);
    }

    const updateData: Record<string, any> = {};

    if (request.data.name && request.data.name !== level.name) {
      updateData['name'] = request.data.name;

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

      updateData['slug'] = slug;
    }

    if (request.data.description !== undefined) {
      updateData['description'] = request.data.description;
    }

    if (request.data.status !== undefined) {
      updateData['status'] = request.data.status;
    }

    if (request.data.topicId !== undefined) {
      updateData['topicId'] = request.data.topicId;
    }

    if (request.data.xpReward !== undefined) {
      updateData['xpReward'] = request.data.xpReward;
    }

    if (request.data.passingPercentage !== undefined) {
      updateData['passingPercentage'] = request.data.passingPercentage;
    }

    return this.levelRepository.update(request.id, updateData);
  }
}
