export abstract class ValueObject<Props> {
  protected readonly props: Props;

  constructor(props: Props) {
    this.props = Object.freeze(props);
  }

  public equals(vo?: ValueObject<Props>): boolean {
    if (vo === null || vo === undefined) {
      return false;
    }
    if (vo.props === undefined) {
      return false;
    }
    return JSON.stringify(this.props) === JSON.stringify(vo.props);
  }

  toJSON() {
    if (
      this.props &&
      typeof this.props === 'object' &&
      !Array.isArray(this.props)
    ) {
      const entries = Object.entries(this.props as Record<string, unknown>);

      if (entries.length === 1 && entries[0]?.[0] === 'value') {
        return entries[0][1];
      }
    }

    return this.props;
  }
}
