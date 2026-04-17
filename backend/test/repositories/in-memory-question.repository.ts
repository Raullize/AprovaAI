import { Question } from '../../src/domain/content/entities/question.entity';
import { QuestionRepository } from '../../src/domain/content/repositories/question.repository';
import { DomainEvents } from '../../src/shared/core/events/domain-events';

export class InMemoryQuestionRepository implements QuestionRepository {
  public items: Question[] = [];

  findAll(): Promise<Question[]> {
    return Promise.resolve(this.items);
  }

  findByLevelId(levelId: string): Promise<Question[]> {
    const questions = this.items.filter((item) => item.levelId === levelId);
    return Promise.resolve(questions.sort((a, b) => a.order - b.order));
  }

  findById(id: string): Promise<Question | null> {
    const question = this.items.find((item) => item.id === id);
    return Promise.resolve(question || null);
  }

  create(question: Question): Promise<Question> {
    this.items.push(question);
    DomainEvents.dispatchEventsForAggregate(question.id);
    return Promise.resolve(question);
  }

  save(question: Question): Promise<Question> {
    const itemIndex = this.items.findIndex((item) => item.id === question.id);

    if (itemIndex >= 0) {
      this.items[itemIndex] = question;
      DomainEvents.dispatchEventsForAggregate(question.id);
    }

    return Promise.resolve(question);
  }

  delete(id: string): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id === id);

    if (itemIndex >= 0) {
      this.items.splice(itemIndex, 1);
    }

    return Promise.resolve();
  }

  reorder(orderedIds: string[]): Promise<void> {
    orderedIds.forEach((id, index) => {
      const question = this.items.find((item) => item.id === id);
      if (question) {
        question.updateOrder(index);
      }
    });
    return Promise.resolve();
  }

  countByLevelId(levelId: string): Promise<number> {
    const count = this.items.filter((item) => item.levelId === levelId).length;
    return Promise.resolve(count);
  }
}
