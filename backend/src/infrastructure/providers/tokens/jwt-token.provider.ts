import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenProvider } from '../../../application/auth/ports/token-provider';

@Injectable()
export class JwtTokenProvider implements TokenProvider {
  constructor(private jwtService: JwtService) {}

  sign(payload: Record<string, any>): string {
    return this.jwtService.sign(payload);
  }
}
