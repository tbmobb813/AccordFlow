import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../common/prisma.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const clerkUserId = request.clerkUserId;

    if (!clerkUserId) {
      return true; // Let ClerkAuthGuard handle this
    }

    // Get tenant from header or query
    const tenantSlug =
      request.headers['x-tenant-slug'] || request.query.tenantSlug || request.body?.tenantSlug;

    if (!tenantSlug) {
      throw new ForbiddenException('Tenant slug is required');
    }

    // Find user and verify tenant access
    const user = await this.prisma.user.findFirst({
      where: {
        clerkUserId,
        tenant: {
          slug: tenantSlug,
        },
      },
      include: {
        tenant: true,
      },
    });

    if (!user) {
      throw new ForbiddenException('Access denied to this tenant');
    }

    // Attach tenant and user to request
    request.tenant = user.tenant;
    request.tenantId = user.tenantId;
    request.user = user;

    return true;
  }
}
