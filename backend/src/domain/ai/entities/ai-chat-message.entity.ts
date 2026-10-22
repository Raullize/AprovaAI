import { Entity } from '../../../shared/core/entity';

export type ChatRole = 'USER' | 'ASSISTANT';

export interface AiChatMessageProps {
  userId: string;
  role: ChatRole;
  content: string;
  createdAt?: Date;
}

export class AiChatMessage extends Entity<AiChatMessageProps> {
  get userId(): string {
    return this.props.userId;
  }

  get role(): ChatRole {
    return this.props.role;
  }

  get content(): string {
    return this.props.content;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  static create(props: AiChatMessageProps, id?: string): AiChatMessage {
    return new AiChatMessage(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );
  }
}
