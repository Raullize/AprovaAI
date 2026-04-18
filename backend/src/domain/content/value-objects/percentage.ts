import { ValueObject } from '../../../shared/core/value-object';
import { ValidationError } from '../../../shared/core/errors/validation.error';

interface PercentageProps {
  value: number;
}

export class Percentage extends ValueObject<PercentageProps> {
  get value(): number {
    return this.props.value;
  }

  private constructor(props: PercentageProps) {
    super(props);
  }

  public static create(value: number): Percentage {
    if (value < 0 || value > 100) {
      throw new ValidationError('Percentage must be between 0 and 100.');
    }

    return new Percentage({ value });
  }
}
