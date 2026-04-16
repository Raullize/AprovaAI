import { Injectable, NotFoundException } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { TopicRepository } from '../../../domain/content/repositories/topic.repository';
import { Topic } from '../../../domain/content/entities/topic.entity';
import { UpdateTopicDto } from '../../../api/topics/dto/topic.dto';
import { generateUniqueSlug } from '../../../shared/utils/slugify';

export interface UpdateTopicRequest {
  id: string;
  data: UpdateTopicDto;
}

@Injectable()
export class UpdateTopicUseCase implements UseCase<UpdateTopicRequest, Topic> {
  constructor(private readonly topicRepository: TopicRepository) {}

  async execute(request: UpdateTopicRequest): Promise<Topic> {
    const topic = await this.topicRepository.findById(request.id);

    if (!topic) {
      throw new NotFoundException(`Topic with ID ${request.id} not found`);
    }

    const updateData: Record<string, any> = {};

    if (request.data.name && request.data.name !== topic.name) {
      updateData['name'] = request.data.name;

      const slug = await generateUniqueSlug(
        request.data.name,
        async (testSlug: string) => {
          const existing = await this.topicRepository.findBySlugAndExamId(
            testSlug,
            topic.examId,
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

    if (request.data.examId !== undefined) {
      updateData['examId'] = request.data.examId;
    }

    return this.topicRepository.update(request.id, updateData);
  }
}
