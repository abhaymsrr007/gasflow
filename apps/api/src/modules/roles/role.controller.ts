import { Request, Response } from 'express';
import { RoleService } from './role.service';
import { z } from 'zod';

const createRoleSchema = z.object({
  name: z.string().min(2),
  permissions: z.array(z.string()), // e.g., ["customer:view", "delivery:create"]
});

export class RoleController {
  static async create(req: Request, res: Response) {
    try {
      const { name, permissions } = createRoleSchema.parse(req.body);
      const tenantId = req.headers['x-tenant-id'] as string; // Frontend se aayega
      
      if (!tenantId) return res.status(400).json({ error: 'Tenant ID required' });

      const role = await RoleService.createRole(tenantId, name, permissions);
      res.status(201).json({ message: 'Role created', role });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async list(req: Request, res: Response) {
    try {
      const tenantId = req.headers['x-tenant-id'] as string;
      if (!tenantId) return res.status(400).json({ error: 'Tenant ID required' });

      const roles = await RoleService.getTenantRoles(tenantId);
      res.json(roles);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}