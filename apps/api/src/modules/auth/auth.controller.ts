import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { SignupSchema, LoginSchema } from './auth.dto';
import { ApiResponse } from '../../shared/utils/apiResponse';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { env } from '../../env';
import { ApiError } from 'src/shared/utils/apiError';
import { prisma } from '@gasflow/db/prisma';

export class AuthController {
  // 1. Signup
  static signup = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = SignupSchema.parse(req.body);
    const result = await AuthService.signup(validatedData);

    return ApiResponse.created(res, result, 'User registered successfully');
  });

  // 2. Login (JWT & Permissions ke saath)
  static login = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = LoginSchema.parse(req.body);

    const { accessToken, refreshToken, expiresAt, payload } = await AuthService.login(validatedData);

    // Check karo ki request mobile app se aayi hai ya web browser se
    const isMobileApp = req.headers['x-client-type'] === 'mobile';

    if (isMobileApp) {
      // 📱 MOBILE APP KE LIYE: Dono tokens JSON mein bhejo
      return ApiResponse.success(res, {
        accessToken,
        refreshToken, // Mobile isko Secure Store mein rakhkhega
        expiresAt,
        user: {
          id: payload.userId,
          role: payload.role,
          tenantId: payload.tenantId,
          permissions: payload.permissions,
        },
      }, 'Logged in successfully');
    }

    // 💻 WEB BROWSER KE LIYE: Cookies set karo, response mein refreshToken mat bhejo
    res.cookie(env.SESSION_COOKIE_NAME, accessToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('gasflow_refresh', refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
    });

    return ApiResponse.success(res, {
      accessToken,
      user: {
        id: payload.userId,
        role: payload.role,
        tenantId: payload.tenantId,
        permissions: payload.permissions,
      },
    }, 'Logged in successfully');
  });


  static refresh = asyncHandler(async (req: Request, res: Response) => {
    const isMobileApp = req.headers['x-client-type'] === 'mobile';

    // Web ke liye cookie se, Mobile ke liye body se token uthao
    const refreshToken = isMobileApp
      ? req.body.refreshToken
      : req.cookies['gasflow_refresh'];

    if (!refreshToken) {
      throw ApiError.unauthorized('Refresh token missing');
    }

    const { accessToken, payload } = await AuthService.refreshSession(refreshToken);

    // Naya Access Token set karo
    if (!isMobileApp) {
      res.cookie(env.SESSION_COOKIE_NAME, accessToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000,
      });
    }

    return ApiResponse.success(res, { accessToken, user: payload }, 'Token refreshed');
  });

  static me = asyncHandler(async (req: Request, res: Response) => {
    // requireAuth middleware pehle hi user ko req.user mein daal chuka hoga
    const user = (req as any).user;

    if (!user) throw ApiError.unauthorized('Not authenticated');

    // User ki full details database se laao
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      include: {
        memberships: {
          include: { role: true }
        }
      }
    });

    if (!dbUser) throw ApiError.unauthorized('User not found');

    const membership = dbUser.memberships.find(m => m.tenantId === user.tenantId);

    return ApiResponse.success(res, {
      id: dbUser.id,
      fullName: dbUser.fullName,
      email: dbUser.email,
      tenantId: user.tenantId,
      role: membership?.role.name,
      permissions: user.permissions,
    }, 'User fetched');
  });

  static logout = asyncHandler(async (req: Request, res: Response) => {
    // Web ke liye cookies clear karo, Mobile ke liye client side pe token clear karna hoga
    res.clearCookie(env.SESSION_COOKIE_NAME);
    res.clearCookie('gasflow_refresh');
    return ApiResponse.success(res, null, 'Logged out successfully');
  })
}