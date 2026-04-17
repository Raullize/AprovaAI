import { ValueObject } from '../../../shared/core/value-object';
import { InvalidSlugError } from '../errors/invalid-slug.error';
import { generateSlug } from '../../../shared/utils/slugify';

interface SlugProps {
  value: string;
}

export class Slug extends ValueObject<SlugProps> {
  get value(): string {
    return this.props.value;
  }

  private constructor(props: SlugProps) {
    super(props);
  }

  static create(slug: string): Slug {
    if (!this.validate(slug)) {
      throw new InvalidSlugError(slug);
    }
    return new Slug({ value: slug });
  }

  /**
   * Creates a valid slug from a raw text string.
   */
  static createFromText(text: string): Slug {
    const slugText = generateSlug(text);
    return new Slug({ value: slugText });
  }

  static validate(slug: string): boolean {
    const re = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return re.test(slug);
  }
}
