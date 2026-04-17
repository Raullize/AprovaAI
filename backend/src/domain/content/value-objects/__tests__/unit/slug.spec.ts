import { Slug } from '../../slug';
import { InvalidSlugError } from '../../../errors/invalid-slug.error';

describe('Slug Value Object', () => {
  it('should create a valid slug', () => {
    const slug = Slug.create('valid-slug-123');
    expect(slug.value).toBe('valid-slug-123');
  });

  it('should throw an error if slug is invalid (contains uppercase)', () => {
    expect(() => {
      Slug.create('Invalid-Slug');
    }).toThrow(InvalidSlugError);
  });

  it('should throw an error if slug is invalid (contains spaces)', () => {
    expect(() => {
      Slug.create('invalid slug');
    }).toThrow(InvalidSlugError);
  });

  it('should throw an error if slug is invalid (special chars)', () => {
    expect(() => {
      Slug.create('slug@invalid');
    }).toThrow(InvalidSlugError);
  });

  it('should create a valid slug from a raw text string', () => {
    const slug = Slug.createFromText('This is a R@W Text 123!');
    expect(slug.value).toBe('this-is-a-rw-text-123');
  });

  it('should consider two identical slugs as equal', () => {
    const slug1 = Slug.create('same-slug');
    const slug2 = Slug.create('same-slug');

    expect(slug1.equals(slug2)).toBe(true);
  });

  it('should consider two different slugs as not equal', () => {
    const slug1 = Slug.create('slug-one');
    const slug2 = Slug.create('slug-two');

    expect(slug1.equals(slug2)).toBe(false);
  });
});
