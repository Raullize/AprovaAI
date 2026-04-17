import { ValueObject } from '../../../shared/core/value-object';
import { InvalidEmailError } from '../errors/invalid-email.error';

interface EmailProps {
  value: string;
}

export class Email extends ValueObject<EmailProps> {
  get value(): string {
    return this.props.value;
  }

  private constructor(props: EmailProps) {
    super(props);
  }

  static create(email: string): Email {
    if (!this.validate(email)) {
      throw new InvalidEmailError(email);
    }
    return new Email({ value: email.toLowerCase().trim() });
  }

  static validate(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
}
