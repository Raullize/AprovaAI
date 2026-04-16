import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, UserRole } from '../decorators/roles.decorator';

interface RequestUser {
  role: UserRole;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user: RequestUser }>();
    const user = request.user;

    if (!user || !user.role || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        'Acesso negado: Requer privilégios de ' + requiredRoles.join(' ou '),
      );
    }

    return true;
  }
}
