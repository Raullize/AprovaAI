import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { LevelRepository } from '../../../domain/content/repositories/level.repository';
import { Level } from '../../../domain/content/entities/level.entity';

@Injectable()
export class FindLevelsByTopicIdUseCase implements UseCase<string, Level[]> {
  constructor(private readonly levelRepository: LevelRepository) {}

  async execute(topicId: string): Promise<Level[]> {
    return this.levelRepository.findByTopicId(topicId);
  }
}
