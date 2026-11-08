import { Request, Response, NextFunction } from 'express';
import { prisma } from '@gasflow/db';
import { ApiError } from '../utils/apiError';

export function authorize(requiredPermission: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    console.log('🔍 Authorize check:', { userId: user?.userId, tenantId: user?.tenantId });
    console.log('🔍 user:', JSON.stringify(user));
    if (!user) return next(ApiError.unauthorized('Authentication required'));

    const member = await prisma.tenantMember.findUnique({
      where: { tenantId_userId: { tenantId: user.tenantId, userId: user.userId } },
      include: { role: { include: { permissions: { include: { permission: true } } } } },
    });

    if (!member) return next(ApiError.forbidden('Not a member of this tenant'));

    // Owner ke paas sab kuch hota hai
    if (member.role.name === 'owner') return next();

    // Check specific permission
    const hasPermission = member.role.permissions.some(
      (rp) => rp.permission.code === requiredPermission
    );

    if (!hasPermission) return next(ApiError.forbidden('Insufficient permissions'));

    next();
  };
}