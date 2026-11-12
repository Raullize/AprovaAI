import { Logger } from '@nestjs/common';
import { ExamRepository } from '../../domain/content/repositories/exam.repository';
import { ChatCatalog } from './prompts/chat.prompt';

export async function loadPublishedChatCatalog(
  examRepository: ExamRepository,
  logger: Logger,
): Promise<ChatCatalog | undefined> {
  try {
    const exams = await examRepository.findAll();
    const published = exams.filter((exam) => exam.status === 'PUBLISHED');

    if (published.length === 0) {
      return undefined;
    }

    return {
      exams: published.map((exam) => ({
        name: exam.name,
        category: exam.category,
        topicsCount: exam.topicsCount,
      })),
    };
  } catch (error) {
    logger.warn(
      'Não foi possível carregar o catálogo de exames para o chat',
      error instanceof Error ? error.stack : undefined,
    );
    return undefined;
  }
}
