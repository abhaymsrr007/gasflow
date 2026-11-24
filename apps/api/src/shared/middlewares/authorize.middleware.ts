import { Request, Response, NextFunction } from 'express';
import { prisma } from '@gasflow/db';
import { ApiError } from '../utils/apiError';

// export function authorize(requiredPermission: string) {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     const user = (req as any).user;

//     console.log('🔍 Authorize check:', { userId: user?.userId, tenantId: user?.tenantId });
//     console.log('🔍 user:', JSON.stringify(user));
//     if (!user) return next(ApiError.unauthorized('Authentication required'));

//     const member = await prisma.tenantMember.findUnique({
//       where: { tenantId_userId: { tenantId: user.tenantId, userId: user.userId } },
//       include: { role: { include: { permissions: { include: { permission: true } } } } },
//     });

//     if (!member) return next(ApiError.forbidden('Not a member of this tenant'));

//     // Owner ke paas sab kuch hota hai
//     if (member.role.name === 'owner') return next();
//     console.log('🔍 Member role:',JSON.stringify(member.role.permissions));
//     // Check specific permission
//     const hasPermission = member.role.permissions.some(
//       (rp) => rp.permission.code === requiredPermission
//     );

//     if (!hasPermission) return next(ApiError.forbidden('Insufficient permissions'));

//     next();
//   };
// }


export function authorize(requiredPermission: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;

      if (!user || !user.userId || !user.tenantId) {
        return next(ApiError.unauthorized('Authentication required'));
      }

      // 👇 Ensure karo ki IDs valid hain (khaali nahi hain)
      if (user.tenantId.trim() === '' || user.userId.trim() === '') {
        return next(ApiError.badRequest('Tenant ID or User ID missing in token'));
      }

      const member = await prisma.tenantMember.findUnique({
        where: {
          tenantId_userId: {
            tenantId: user.tenantId,
            userId: user.userId,
          },
        },
        include: {
          role: {
            include: {
              permissions: { include: { permission: true } },
            },
          },
        },
      });

      if (!member) {
        return next(ApiError.forbidden('Not a member of this tenant'));
      }

      if (member.role.name === 'owner') {
        return next();
      }

      const hasPermission = member.role.permissions.some(
        (rp) => rp.permission.code === requiredPermission
      );

      if (!hasPermission) {
        return next(ApiError.forbidden('Insufficient permissions'));
      }

      next();
    } catch (error) {
      next(error); // 👈 Error ko Global Error Handler tak bhejo (crash mat hone do)
    }
  };
}