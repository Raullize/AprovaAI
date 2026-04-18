import { Level } from '../../level.entity';
import { Slug } from '../../../value-objects/slug';
import { Percentage } from '../../../value-objects/percentage';

describe('Level Entity', () => {
  it('should be able to create a level', () => {
    const level = Level.create({
      name: 'Test Level',
      slug: Slug.createFromText('test-level'),
      topicId: 'topic-1',
      order: 1,
    });

    expect(level).toBeDefined();
    expect(level.id).toBeDefined();
    expect(level.name).toBe('Test Level');
    expect(level.status).toBe('ACTIVE');
    expect(level.xpReward).toBe(0);
    expect(level.passingPercentage).toBe(70.0);
  });

  it('should activate a level', () => {
    const level = Level.create({
      name: 'Test Level',
      slug: Slug.createFromText('test-level'),
      topicId: 'topic-1',
      order: 1,
      status: 'INACTIVE',
    });

    level.activate();

    expect(level.status).toBe('ACTIVE');
    expect(level.updatedAt).toBeDefined();
  });

  it('should deactivate a level', () => {
    const level = Level.create({
      name: 'Test Level',
      slug: Slug.createFromText('test-level'),
      topicId: 'topic-1',
      order: 1,
    });

    level.deactivate();

    expect(level.status).toBe('INACTIVE');
  });

  it('should update level details', () => {
    const level = Level.create({
      name: 'Test Level',
      slug: Slug.createFromText('test-level'),
      topicId: 'topic-1',
      order: 1,
    });

    level.updateDetails({
      name: 'Updated Level',
      description: 'New Description',
      slug: Slug.createFromText('updated-level'),
      topicId: 'topic-2',
      xpReward: 50,
      passingPercentage: Percentage.create(80.0),
    });

    expect(level.name).toBe('Updated Level');
    expect(level.description).toBe('New Description');
    expect(level.slug.value).toBe('updated-level');
    expect(level.topicId).toBe('topic-2');
    expect(level.xpReward).toBe(50);
    expect(level.passingPercentage).toBe(80.0);
  });

  it('should throw error when updating details with invalid passing percentage', () => {
    const level = Level.create({
      name: 'Test Level',
      slug: Slug.createFromText('test-level'),
      topicId: 'topic-1',
      order: 1,
    });

    expect(() => {
      level.updateDetails({
        name: 'Updated Level',
        description: 'New Description',
        slug: Slug.createFromText('updated-level'),
        topicId: 'topic-2',
        xpReward: 50,
        passingPercentage: Percentage.create(150.0), // Invalid percentage throws
      });
    }).toThrow('Percentage must be between 0 and 100.');
  });

  it('should update level order', () => {
    const level = Level.create({
      name: 'Test Level',
      slug: Slug.createFromText('test-level'),
      topicId: 'topic-1',
      order: 1,
    });

    level.updateOrder(5);

    expect(level.order).toBe(5);
  });
});
