import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { SignupSchema, LoginSchema } from './auth.dto';
import { ApiResponse } from '../../shared/utils/apiResponse';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { env } from '../../env';

export class AuthController {
  // 1. Signup
  static signup = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = SignupSchema.parse(req.body);
    const result = await AuthService.signup(validatedData);

    return ApiResponse.created(res, result, 'User registered successfully');
  });

  // 2. Login (JWT & Permissions ke saath)
  //  static login = asyncHandler(async (req: Request, res: Response) => {
  //   const validatedData = LoginSchema.parse(req.body);
  //   const { accessToken, refreshToken, expiresAt, payload } = await AuthService.login(validatedData);

  //   // Refresh Token ko HttpOnly Cookie mein bhejo (Secure)
  //   res.cookie('gasflow_refresh', refreshToken, {
  //     httpOnly: true,
  //     secure: env.NODE_ENV === 'production',
  //     sameSite: 'lax',
  //     expires: expiresAt,
  //   });

  //   // Access Token JSON mein bhejo
  //   return ApiResponse.success(res, {
  //     accessToken, // Frontend isko memory mein rakhega (localStorage mein nahi)
  //     user: {
  //       id: payload.userId,
  //       role: payload.role,
  //       tenantId: payload.tenantId,
  //       permissions: payload.permissions,
  //     },
  //   }, 'Logged in successfully');
  // });

  static login = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = LoginSchema.parse(req.body);

    // Service se accessToken aur refreshToken dono le rahe hain
    const { accessToken, refreshToken, expiresAt, payload } = await AuthService.login(validatedData);

    // 👇 Access Token ko 'gasflow_sid' cookie mein set karo (15 min ke liye)
    res.cookie(env.SESSION_COOKIE_NAME, accessToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    // 👇 Refresh Token ko 'gasflow_refresh' cookie mein set karo (7 days ke liye)
    res.cookie('gasflow_refresh', refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
    });

    return ApiResponse.success(res, {
      accessToken, // Frontend/Mobile app ke liye response mein bhi bhej do
      user: {
        id: payload.userId,
        role: payload.role,
        tenantId: payload.tenantId,
        permissions: payload.permissions,
      },
    }, 'Logged in successfully');
  });
}