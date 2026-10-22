import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AiChatMessageRepository } from '../../../../domain/ai/repositories/ai-chat-message.repository';
import { AiChatMessage } from '../../../../domain/ai/entities/ai-chat-message.entity';
import { PrismaAiChatMessageMapper } from '../mappers/prisma-ai-chat-message.mapper';

@Injectable()
export class PrismaAiChatMessageRepository implements AiChatMessageRepository {
  constructor(private prisma: PrismaService) {}

  async create(message: AiChatMessage): Promise<AiChatMessage> {
    const data = PrismaAiChatMessageMapper.toPrisma(message);
    const created = await this.prisma.aiChatMessage.create({ data });
    return PrismaAiChatMessageMapper.toDomain(created);
  }

  async findRecentByUserId(
    userId: string,
    limit: number,
  ): Promise<AiChatMessage[]> {
    const results = await this.prisma.aiChatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return results
      .reverse()
      .map((result) => PrismaAiChatMessageMapper.toDomain(result));
  }
}
