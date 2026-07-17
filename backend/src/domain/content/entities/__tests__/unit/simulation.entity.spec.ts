import { Simulation } from '../../simulation.entity';
import { Slug } from '../../../value-objects/slug';
import { Percentage } from '../../../value-objects/percentage';

describe('Simulation Entity', () => {
  it('should be able to create a simulation', () => {
    const simulation = Simulation.create({
      name: 'Test Simulation',
      slug: Slug.createFromText('test-simulation'),
      topicId: 'topic-1',
      order: 1,
    });

    expect(simulation).toBeDefined();
    expect(simulation.id).toBeDefined();
    expect(simulation.name).toBe('Test Simulation');
    expect(simulation.status).toBe('PUBLISHED');
    expect(simulation.xpReward).toBe(0);
    expect(simulation.passingPercentage).toBe(70.0);
  });

  it('should activate a simulation', () => {
    const simulation = Simulation.create({
      name: 'Test Simulation',
      slug: Slug.createFromText('test-simulation'),
      topicId: 'topic-1',
      order: 1,
      status: 'DRAFT',
    });

    simulation.activate();

    expect(simulation.status).toBe('PUBLISHED');
    expect(simulation.updatedAt).toBeDefined();
  });

  it('should deactivate a simulation', () => {
    const simulation = Simulation.create({
      name: 'Test Simulation',
      slug: Slug.createFromText('test-simulation'),
      topicId: 'topic-1',
      order: 1,
    });

    simulation.deactivate();

    expect(simulation.status).toBe('DRAFT');
  });

  it('should update simulation details', () => {
    const simulation = Simulation.create({
      name: 'Test Simulation',
      slug: Slug.createFromText('test-simulation'),
      topicId: 'topic-1',
      order: 1,
    });

    simulation.updateDetails({
      name: 'Updated Simulation',
      description: 'New Description',
      slug: Slug.createFromText('updated-simulation'),
      topicId: 'topic-2',
      xpReward: 50,
      passingPercentage: Percentage.create(80.0),
    });

    expect(simulation.name).toBe('Updated Simulation');
    expect(simulation.description).toBe('New Description');
    expect(simulation.slug.value).toBe('updated-simulation');
    expect(simulation.topicId).toBe('topic-2');
    expect(simulation.xpReward).toBe(50);
    expect(simulation.passingPercentage).toBe(80.0);
  });

  it('should throw error when updating details with invalid passing percentage', () => {
    const simulation = Simulation.create({
      name: 'Test Simulation',
      slug: Slug.createFromText('test-simulation'),
      topicId: 'topic-1',
      order: 1,
    });

    expect(() => {
      simulation.updateDetails({
        name: 'Updated Simulation',
        description: 'New Description',
        slug: Slug.createFromText('updated-simulation'),
        topicId: 'topic-2',
        xpReward: 50,
        passingPercentage: Percentage.create(150.0), // Invalid percentage throws
      });
    }).toThrow('Percentage must be between 0 and 100.');
  });

  it('should update simulation order', () => {
    const simulation = Simulation.create({
      name: 'Test Simulation',
      slug: Slug.createFromText('test-simulation'),
      topicId: 'topic-1',
      order: 1,
    });

    simulation.updateOrder(5);

    expect(simulation.order).toBe(5);
  });
});
