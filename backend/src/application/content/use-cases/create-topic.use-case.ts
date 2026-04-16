import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { TopicRepository } from '../../../domain/content/repositories/topic.repository';
import { Topic } from '../../../domain/content/entities/topic.entity';
import { CreateTopicDto } from '../../../api/topics/dto/topic.dto';
import { generateUniqueSlug } from '../../../shared/utils/slugify';

@Injectable()
export class CreateTopicUseCase implements UseCase<CreateTopicDto, Topic> {
  constructor(private readonly topicRepository: TopicRepository) {}

  async execute(request: CreateTopicDto): Promise<Topic> {
    const count = await this.topicRepository.countByExamId(request.examId);

    const slug = await generateUniqueSlug(
      request.name,
      async (testSlug: string) => {
        const existing = await this.topicRepository.findBySlugAndExamId(
          testSlug,
          request.examId,
        );
        return !!existing;
      },
    );

    const topic = Topic.create({
      name: request.name,
      slug,
      description: request.description,
      status: request.status,
      examId: request.examId,
      order: count,
    });

    return this.topicRepository.create(topic);
  }
}
