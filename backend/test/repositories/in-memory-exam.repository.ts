import { Exam } from '../../src/domain/content/entities/exam.entity';
import { ExamRepository } from '../../src/domain/content/repositories/exam.repository';

export class InMemoryExamRepository implements ExamRepository {
  public items: Exam[] = [];

  async findAll(): Promise<Exam[]> {
    return Promise.resolve(this.items.sort((a, b) => a.order - b.order));
  }

  async findById(id: string): Promise<Exam | null> {
    const exam = this.items.find((item) => item.id === id);
    return Promise.resolve(exam || null);
  }

  async findBySlug(slug: string): Promise<Exam | null> {
    const exam = this.items.find((item) => item.slug.value === slug);
    return Promise.resolve(exam || null);
  }

  async create(exam: Exam): Promise<Exam> {
    this.items.push(exam);
    return Promise.resolve(exam);
  }

  async save(exam: Exam): Promise<Exam> {
    const itemIndex = this.items.findIndex((item) => item.id === exam.id);
    if (itemIndex >= 0) {
      this.items[itemIndex] = exam;
    } else {
      this.items.push(exam);
    }
    return Promise.resolve(exam);
  }

  async delete(id: string): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id === id);
    if (itemIndex >= 0) {
      this.items.splice(itemIndex, 1);
    }
    return Promise.resolve();
  }

  async reorder(ids: string[]): Promise<void> {
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      const exam = this.items.find((item) => item.id === id);
      if (exam) {
        exam.updateOrder(i);
      }
    }
    return Promise.resolve();
  }

  async count(): Promise<number> {
    return Promise.resolve(this.items.length);
  }
}
