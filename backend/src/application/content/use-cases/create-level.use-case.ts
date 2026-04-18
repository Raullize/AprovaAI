import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { LevelRepository } from '../../../domain/content/repositories/level.repository';
import { Level } from '../../../domain/content/entities/level.entity';
import { Slug } from '../../../domain/content/value-objects/slug';
import { Percentage } from '../../../domain/content/value-objects/percentage';
import { generateUniqueSlug } from '../../../shared/utils/slugify';

export interface CreateLevelRequest {
  name: string;
  description?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  topicId: string;
  xpReward?: number;
  passingPercentage?: number;
}

@Injectable()
export class CreateLevelUseCase implements UseCase<CreateLevelRequest, Level> {
  constructor(private readonly levelRepository: LevelRepository) {}

  async execute(request: CreateLevelRequest): Promise<Level> {
    const count = await this.levelRepository.countByTopicId(request.topicId);

    const slug = await generateUniqueSlug(
      request.name,
      async (testSlug: string) => {
        const existing = await this.levelRepository.findBySlugAndTopicId(
          testSlug,
          request.topicId,
        );
        return !!existing;
      },
    );

    const level = Level.create({
      name: request.name,
      slug: Slug.create(slug),
      description: request.description,
      status: request.status,
      topicId: request.topicId,
      xpReward: request.xpReward,
      passingPercentage: request.passingPercentage !== undefined ? Percentage.create(request.passingPercentage) : undefined,
      order: count,
    });

    return this.levelRepository.create(level);
  }
}
