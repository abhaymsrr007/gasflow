import { prisma } from '@gasflow/db';

export class RoleService {
  static async createRole(tenantId: string, name: string, permissions: string[]) {
    // 1. Check if role already exists for this tenant
    const existing = await prisma.role.findFirst({
      where: { tenantId, name },
    });
    if (existing) throw new Error('Role with this name already exists');

    // 2. Create role
    const role = await prisma.role.create({
      data: { tenantId, name, isSystem: false },
    });

    // 3. Attach permissions
    if (permissions.length > 0) {
      const dbPermissions = await prisma.permission.findMany({
        where: { code: { in: permissions } },
      });

      await prisma.rolePermission.createMany({
        data: dbPermissions.map((p) => ({
          roleId: role.id,
          permissionId: p.id,
        })),
      });
    }

    return role;
  }

  static async getTenantRoles(tenantId: string) {
    return prisma.role.findMany({
      where: { OR: [{ tenantId }, { isSystem: true }] },
      include: { permissions: { include: { permission: true } } },
    });
  }
}