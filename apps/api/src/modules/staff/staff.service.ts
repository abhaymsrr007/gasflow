import { prisma } from '@gasflow/db';
import argon2 from 'argon2';
import { CreateStaffDTO, PaginationDTO, UpdateStaffDTO } from './staff.dto';
import { ApiError } from '../../shared/utils/apiError';

export class StaffService {
  // 1. Create Staff (Pichhla wala)
  static async createStaff(tenantId: string, data: CreateStaffDTO) {
    const role = await prisma.role.findFirst({
      where: { name: data.roleName, OR: [{ tenantId }, { isSystem: true }] },
    });
    if (!role) throw ApiError.badRequest('Invalid role specified');

    const isSystemUser = ['manager', 'accountant'].includes(data.roleName);

    if (isSystemUser) {
      if (!data.email || !data.password) throw ApiError.badRequest('Email and password required');

      const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
      if (existingUser) throw ApiError.conflict('Email already registered');

      const passwordHash = await argon2.hash(data.password, {
        type: argon2.argon2id, memoryCost: 65536, timeCost: 3, parallelism: 1,
      });

      return prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: { email: data.email!, passwordHash, fullName: data.fullName },
        });
        return tx.tenantMember.create({
          data: { tenantId, userId: user.id, roleId: role.id },
        });
      });
    } else {
      if (!data.phone) throw ApiError.badRequest('Phone required for field staff');
      const tempEmail = `${data.phone}@staff.local`;

      return prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: { email: tempEmail, passwordHash: 'NOT_LOGGABLE', fullName: data.fullName, phone: data.phone || null },
        });
        return tx.tenantMember.create({
          data: { tenantId, userId: user.id, roleId: role.id },
        });
      });
    }
  }

  // 2. List Staff
  static async listStaff(tenantId: string, query: PaginationDTO) {
    const { page, limit, search } = query;
    const skip = (page - 1) * limit;

    // Search filter (naam ya phone se)
    const whereClause: any = { tenantId };
    if (search) {
      whereClause.OR = [
        { user: { fullName: { contains: search, mode: 'insensitive' } } },
        { user: { phone: { contains: search } } },
      ];
    }

    // Data aur Total Count ek saath fetch karo (Transaction mein)
    const [staff, total] = await prisma.$transaction([
      prisma.tenantMember.findMany({
        where: whereClause,
        skip: skip,
        take: limit,
        include: {
          user: { select: { fullName: true, email: true, phone: true, isActive: true } },
          role: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.tenantMember.count({ where: whereClause }),
    ]);

    return {
      data: staff,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 3. Update Staff (Naam, phone change karna)
  static async updateStaff(tenantId: string, staffId: string, data: UpdateStaffDTO) {
    // Check karo ki staff us tenant ka hai
    const member = await prisma.tenantMember.findFirst({
      where: { id: staffId, tenantId },
    });
    if (!member) throw ApiError.notFound('Staff member not found');

    const updateData: any = {};
    if (data.fullName !== undefined) updateData.fullName = data.fullName;
    if (data.phone !== undefined) updateData.phone = data.phone || null;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    return prisma.user.update({
      where: { id: member.userId },
      data: updateData,
    });
  }

  // 4. Deactivate Staff (Soft Delete)
  static async deactivateStaff(tenantId: string, staffId: string) {
    const member = await prisma.tenantMember.findFirst({
      where: { id: staffId, tenantId },
      include: { role: true },
    });
    if (!member) throw ApiError.notFound('Staff member not found');

    if (member.role.name === 'owner') {
      throw ApiError.forbidden('Owner cannot be deactivated');
    }

    return prisma.user.update({
      where: { id: member.userId },
      data: { isActive: false },
    });
  }
}