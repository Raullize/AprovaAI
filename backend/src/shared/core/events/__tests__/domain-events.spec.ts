import { AggregateRoot } from '../../aggregate-root';
import { DomainEvent } from '../domain-event';
import { DomainEvents } from '../domain-events';

class CustomAggregateCreated implements DomainEvent {
  public ocurredAt: Date;
  private aggregate: CustomAggregate;

  constructor(aggregate: CustomAggregate) {
    this.ocurredAt = new Date();
    this.aggregate = aggregate;
  }

  public getAggregateId(): string {
    return this.aggregate.id;
  }
}

class CustomAggregate extends AggregateRoot<any> {
  static create() {
    const aggregate = new CustomAggregate(null);
    aggregate.addDomainEvent(new CustomAggregateCreated(aggregate));
    return aggregate;
  }
}

describe('Domain Events', () => {
  it('should be able to dispatch and listen to events', () => {
    const callbackSpy = jest.fn();

    // Registra um ouvinte para o evento CustomAggregateCreated
    DomainEvents.register(callbackSpy, CustomAggregateCreated.name);

    // Cria o agregado, o que dispara a criação do evento internamente
    const aggregate = CustomAggregate.create();

    // Verifica se o evento foi criado, mas ainda não despachado
    expect(aggregate.domainEvents).toHaveLength(1);

    // Salva/Despacha os eventos (o que os repositórios fazem no save/create)
    DomainEvents.dispatchEventsForAggregate(aggregate.id);

    // O ouvinte deve ter sido chamado
    expect(callbackSpy).toHaveBeenCalled();

    // A lista de eventos pendentes no agregado deve estar vazia
    expect(aggregate.domainEvents).toHaveLength(0);
  });
});
