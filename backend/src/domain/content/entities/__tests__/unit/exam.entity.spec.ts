import { Exam } from '../../exam.entity';
import { Slug } from '../../../value-objects/slug';

describe('Exam Entity', () => {
  it('should create an exam with default values', () => {
    const exam = Exam.create({
      name: 'Test Exam',
      slug: Slug.create('test-exam'),
    });

    expect(exam.id).toBeDefined();
    expect(exam.name).toBe('Test Exam');
    expect(exam.slug.value).toBe('test-exam');
    expect(exam.status).toBe('PUBLISHED');
    expect(exam.order).toBe(0);
    expect(exam.createdAt).toBeInstanceOf(Date);
    expect(exam.updatedAt).toBeInstanceOf(Date);
  });

  it('should activate an exam', () => {
    const exam = Exam.create({
      name: 'Test Exam',
      slug: Slug.create('test-exam'),
      status: 'DRAFT',
    });

    expect(exam.status).toBe('DRAFT');

    exam.activate();

    expect(exam.status).toBe('PUBLISHED');
  });

  it('should deactivate an exam', () => {
    const exam = Exam.create({
      name: 'Test Exam',
      slug: Slug.create('test-exam'),
      status: 'PUBLISHED',
    });

    expect(exam.status).toBe('PUBLISHED');

    exam.deactivate();

    expect(exam.status).toBe('DRAFT');
  });

  it('should update exam details and change updatedAt', () => {
    const exam = Exam.create({
      name: 'Old Name',
      slug: Slug.create('old-slug'),
      description: 'Old Description',
    });

    const newSlug = Slug.create('new-slug');
    exam.updateDetails({
      name: 'New Name',
      description: 'New Description',
      slug: newSlug,
    });

    expect(exam.name).toBe('New Name');
    expect(exam.description).toBe('New Description');
    expect(exam.slug.value).toBe('new-slug');
    expect(exam.updatedAt).toBeDefined();
  });
});
