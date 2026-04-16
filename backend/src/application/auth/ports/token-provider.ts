export abstract class TokenProvider {
  abstract sign(payload: Record<string, any>): string;
}
