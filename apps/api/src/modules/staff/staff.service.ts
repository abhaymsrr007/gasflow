import { prisma } from '@gasflow/db';
import argon2 from 'argon2';
import { CreateStaffDTO } from './staff.dto';
import { ApiError } from '../../shared/utils/apiError';

export class StaffService {
  static async createStaff(tenantId: string, data: CreateStaffDTO) {
    // 1. Role dhoondo (custom ya system)
    const role = await prisma.role.findFirst({
      where: { name: data.roleName, OR: [{ tenantId }, { isSystem: true }] },
    });
    if (!role) throw ApiError.badRequest('Invalid role specified');

    // 2. Agar system user hai (Manager/Accountant), toh email/password zaroori hai
    const isSystemUser = ['manager', 'accountant'].includes(data.roleName);

    if (isSystemUser) {
      if (!data.email || !data.password) {
        throw ApiError.badRequest('Email and password are required for system users');
      }

      const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
      if (existingUser) throw ApiError.conflict('Email already registered');

      const passwordHash = await argon2.hash(data.password, {
        type: argon2.argon2id, memoryCost: 65536, timeCost: 3, parallelism: 1,
      });

      // Transaction mein user aur member dono banao
      return prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: { email: data.email!, passwordHash, fullName: data.fullName },
        });

        return tx.tenantMember.create({
          data: { tenantId, userId: user.id, roleId: role.id },
        });
      });
    } else {
      // 3. Agar field staff hai (Driver/Delivery Man), toh phone zaroori hai
      if (!data.phone) throw ApiError.badRequest('Phone is required for field staff');
      
      // Note: Field staff ke liye hum ek alag 'Staff' table banayenge (future mein). 
      // Abhi ke liye hum unhe bhi TenantMember mein hi daal rahe hain, par bina User account ke.
      // (Real implementation mein yahan alag 'staff' table ka use hoga).
      
      // TODO: Staff table create karke wahan entry karo
      // Abhi ke liye hum ek temporary User account bana rahe hain bina password ke (sirf record ke liye)
      
      const tempEmail = `${data.phone}@staff.local`;
      
      return prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: { email: tempEmail, passwordHash: 'NOT_LOGGABLE', fullName: data.fullName },
        });
        
        return tx.tenantMember.create({
          data: { tenantId, userId: user.id, roleId: role.id },
        });
      });
    }
  }
}