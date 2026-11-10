import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { SignupSchema, LoginSchema } from './auth.dto';
import { ApiResponse } from '../../shared/utils/apiResponse';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { env } from '../../env';
import { ApiError } from 'src/shared/utils/apiError';

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
}