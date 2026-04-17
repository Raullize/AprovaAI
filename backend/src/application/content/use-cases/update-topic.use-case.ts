import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { TopicRepository } from '../../../domain/content/repositories/topic.repository';
import { Topic } from '../../../domain/content/entities/topic.entity';
import { Slug } from '../../../domain/content/value-objects/slug';
import { generateUniqueSlug } from '../../../shared/utils/slugify';
import { ResourceNotFoundError } from '../../../shared/core/errors/resource-not-found.error';

export interface UpdateTopicRequest {
  id: string;
  data: {
    name?: string;
    description?: string;
    status?: 'ACTIVE' | 'INACTIVE';
    examId?: string;
  };
}

@Injectable()
export class UpdateTopicUseCase implements UseCase<UpdateTopicRequest, Topic> {
  constructor(private readonly topicRepository: TopicRepository) {}

  async execute(request: UpdateTopicRequest): Promise<Topic> {
    const topic: Topic | null = await this.topicRepository.findById(request.id);

    if (!topic) {
      throw new ResourceNotFoundError('Topic', request.id);
    }

    if (request.data.name && request.data.name !== topic.name) {
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
      topic.updateDetails(
        request.data.name,
        request.data.description ?? topic.description,
        Slug.create(slug),
        request.data.examId ?? topic.examId,
      );
    } else if (
      request.data.description !== undefined ||
      request.data.examId !== undefined
    ) {
      topic.updateDetails(
        topic.name,
        request.data.description ?? topic.description,
        topic.slug,
        request.data.examId ?? topic.examId,
      );
    }

    if (request.data.status !== undefined) {
      if (request.data.status === 'ACTIVE') {
        topic.activate();
      } else {
        topic.deactivate();
      }
    }

    return this.topicRepository.save(topic);
  }
}
