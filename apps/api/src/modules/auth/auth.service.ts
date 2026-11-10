import { prisma } from '@gasflow/db';
import argon2 from 'argon2';
import jwt, { SignOptions } from 'jsonwebtoken';
import { SignupDTO, LoginDTO, AuthResponseData } from './auth.dto';
import { ApiError } from '../../shared/utils/apiError';
import { env } from '../../env';
import { randomBytes, createHash } from 'crypto';

export class AuthService {
  
  static async signup(data: SignupDTO): Promise<AuthResponseData> {
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingUser) throw ApiError.conflict('Email already in use');

  const passwordHash = await argon2.hash(data.password, {
    type: argon2.argon2id, memoryCost: 65536, timeCost: 3, parallelism: 1,
  });

  // Transaction: User, Tenant, Member sab ek saath banao
  const result = await prisma.$transaction(async (tx) => {
    // 1. User create
    const user = await tx.user.create({
      data: { email: data.email, passwordHash, fullName: data.fullName },
    });

    // 2. Tenant create (trial ke saath)
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 3);

    const tenant = await tx.tenant.create({
      data: { 
        name: data.agencyName, 
        trialEndsAt, 
        subscriptionStatus: 'trial' 
      },
    });

    // 3. Owner role find karo
    const ownerRole = await tx.role.findFirst({
      where: { name: 'owner', isSystem: true },
    });
    
    if (!ownerRole) {
      throw new Error('Owner role not found. Did you run the seed script?');
    }

    // 4. TenantMember create (Sabse Important)
    await tx.tenantMember.create({
      data: {
        tenantId: tenant.id,
        userId: user.id,
        roleId: ownerRole.id,
      },
    });

    return { userId: user.id, tenantId: tenant.id };
  });

  return result;
}

  

  static async login(data: LoginDTO) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) throw ApiError.unauthorized('Invalid credentials');

    const validPassword = await argon2.verify(user.passwordHash, data.password);
    if (!validPassword) throw ApiError.unauthorized('Invalid credentials');

    const membership = await prisma.tenantMember.findFirst({
      where: { userId: user.id },
      include: { role: { include: { permissions: { include: { permission: true } } } }, tenant: true },
    });

    if (!membership) throw ApiError.forbidden('User is not part of any agency');

    const permissions = (membership.role.isSystem && membership.role.name === 'owner') 
      ? ['*'] : membership.role.permissions.map(p => p.permission.code);

    const payload = {
      userId: user.id,
      tenantId: membership.tenantId,
      role: membership.role.name,
      permissions,
    };

    // 1. Access Token (15 Minutes)
    const accessToken = jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

    // 2. Refresh Token (7 Days) - Random string
    const refreshToken = randomBytes(40).toString('hex');
    const refreshTokenHash = createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 din

    // DB mein hash save karo
    await prisma.session.create({
      data: { userId: user.id, refreshTokenHash, expiresAt }
    });

    return { accessToken, refreshToken, expiresAt, payload };
  }


  static async refreshSession(refreshToken: string) {
    // 1. Token ka hash banao
    const tokenHash = createHash('sha256').update(refreshToken).digest('hex');

    // 2. Database mein check karo
    const session = await prisma.session.findUnique({
      where: { refreshTokenHash: tokenHash },
      include: {
        user: {
          include: {
            memberships: {
              include: {
                role: {
                  include: {
                    permissions: { include: { permission: true } }
                  }
                },
                tenant: true
              }
            }
          }
        }
      },
    });

    // 3. Agar session nahi mila ya expire ho gaya
    if (!session || session.expiresAt < new Date()) {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    // 4. User ki membership nikaalo (Assuming user ka ek hi tenant hai abhi)
    const membership = session.user.memberships[0];
    if (!membership) {
      throw ApiError.forbidden('User is not part of any agency');
    }

    // 5. Permissions nikaalo
    const permissions = (membership.role.isSystem && membership.role.name === 'owner')
      ? ['*']
      : membership.role.permissions.map(p => p.permission.code);

    // 6. Naya Payload aur Access Token banao
    const payload = {
      userId: session.userId,
      tenantId: membership.tenantId,
      role: membership.role.name,
      permissions,
    };

    const accessToken = jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

    return { accessToken, payload };
  }
}