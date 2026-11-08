// import { Request, Response, NextFunction } from 'express';
// import { prisma } from '@gasflow/db';
// import crypto from 'crypto';

// export async function requireAuth(req: Request, res: Response, next: NextFunction) {
//   try {
//     const cookieName = process.env['SESSION_COOKIE_NAME'] || 'gasflow_sid';
//     const token = req.cookies[cookieName];

//     if (!token) {
//       return res.status(401).json({ error: 'Not authenticated' });
//     }

//     const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

//     const session = await prisma.session.findUnique({
//       where: { tokenHash },
//       include: { user: true },
//     });

//     if (!session || session.expiresAt < new Date()) {
//       return res.status(401).json({ error: 'Session expired' });
//     }

//     (req as any).user = session.user;
//     next();
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// }


import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/apiError';
import { env } from '../../env';

// JWT Payload ka type
export interface JwtPayload {
  userId: string;
  tenantId: string;
  role: string;
  permissions: string[];
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  // 1. Token nikaalo (Cookie se ya Header se)
  // console.log('🔍 requireAuth middleware triggered',req.headers,req.cookies);
  const token = req.cookies[env.SESSION_COOKIE_NAME] || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return next(ApiError.unauthorized('Authentication required'));
  }

  try {
    // 2. JWT Verify karo
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    // 3. Request mein user attach karo
    (req as any).user = decoded;

    next();
  } catch (error) {
    return next(ApiError.unauthorized('Invalid or expired token'));
  }
};