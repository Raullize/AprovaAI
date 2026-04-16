import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { LevelRepository } from '../../../domain/content/repositories/level.repository';
import { Level } from '../../../domain/content/entities/level.entity';
import { CreateLevelDto } from '../../../api/levels/dto/level.dto';
import { generateUniqueSlug } from '../../../shared/utils/slugify';

@Injectable()
export class CreateLevelUseCase implements UseCase<CreateLevelDto, Level> {
  constructor(private readonly levelRepository: LevelRepository) {}

  async execute(request: CreateLevelDto): Promise<Level> {
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
      slug,
      description: request.description,
      status: request.status,
      topicId: request.topicId,
      xpReward: request.xpReward,
      passingPercentage: request.passingPercentage,
      order: count,
    });

    return this.levelRepository.create(level);
  }
}
