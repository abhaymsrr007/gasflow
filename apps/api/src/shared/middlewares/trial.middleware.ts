import { Request, Response, NextFunction } from 'express';
import { prisma } from '@gasflow/db';
import { ApiError } from '../utils/apiError';

export async function checkSubscription(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).user; // requireAuth middleware se aayega (jisme tenantId hai)
    if (!user || !user.tenantId) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: user.tenantId },
    });

    if (!tenant || !tenant.isActive) {
      return next(ApiError.forbidden('Agency is suspended or inactive'));
    }

    const now = new Date();

    // 1. Agar Trial chal raha hai
    if (tenant.subscriptionStatus === 'trial') {
      if (tenant.trialEndsAt && tenant.trialEndsAt < now) {
        // Trial khatam ho gaya
        return next(ApiError.forbidden('Your 3-day free trial has expired. Please upgrade to continue.'));
      }
      return next(); // Trial valid hai
    }

    // 2. Agar Paid Subscription hai
    if (tenant.subscriptionStatus === 'active') {
      if (tenant.subscriptionEndsAt && tenant.subscriptionEndsAt < now) {
        return next(ApiError.forbidden('Your subscription has expired. Please renew.'));
      }
      return next(); // Subscription valid hai
    }

    return next(ApiError.forbidden('Invalid subscription status'));
  } catch (error) {
    next(error);
  }
}