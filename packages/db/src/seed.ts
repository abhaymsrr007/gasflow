// import { PrismaClient } from './generated/client/client';
// import { PrismaPg } from '@prisma/adapter-pg';
// import pg from 'pg';
// import dotenv from 'dotenv';
// import path from 'path';
// import { fileURLToPath } from 'url'; // 👈 Ye add karo 

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// const pool = new pg.Pool({ connectionString: process.env['DATABASE_URL_OWNER'] });
// const adapter = new PrismaPg(pool);
// const prisma = new PrismaClient({ adapter });

// const permissions = [
//   { code: 'customer:view', description: 'View customers' },
//   { code: 'customer:create', description: 'Create customers' },
//   { code: 'customer:update', description: 'Update customers' },
//   { code: 'customer:delete', description: 'Delete customers' },
//   { code: 'delivery:view', description: 'View deliveries' },
//   { code: 'delivery:create', description: 'Create deliveries' },
//   { code: 'delivery:update', description: 'Update deliveries' },
//   { code: 'payment:collect', description: 'Collect payments' },
//   { code: 'invoice:view', description: 'View invoices' },
//   { code: 'invoice:create', description: 'Create invoices' },
//   { code: 'staff:view', description: 'View staff' },
//   { code: 'staff:manage', description: 'Add/Remove staff' },
//   { code: 'settings:manage', description: 'Manage tenant settings' },
// ];

// async function main() {
//   console.log('🌱 Seeding permissions...');
//   for (const p of permissions) {
//     await prisma.permission.upsert({
//       where: { code: p.code },
//       update: {},
//       create: p,
//     });
//   }
//   console.log('✅ Permissions seeded successfully!');
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });







import { PrismaClient } from './generated/client/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const dbUrl = process.env['DATABASE_URL_OWNER'];
if (!dbUrl) {
  console.error("❌ DATABASE_URL_OWNER missing in .env");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: dbUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// 1. Permissions List
const permissions = [
  { code: 'customer:view', description: 'View customers' },
  { code: 'customer:create', description: 'Create customers' },
  { code: 'customer:update', description: 'Update customers' },
  { code: 'customer:delete', description: 'Delete customers' },
  { code: 'delivery:view', description: 'View deliveries' },
  { code: 'delivery:create', description: 'Create deliveries' },
  { code: 'delivery:update', description: 'Update deliveries' },
  { code: 'payment:collect', description: 'Collect payments' },
  { code: 'invoice:view', description: 'View invoices' },
  { code: 'invoice:create', description: 'Create invoices' },
  { code: 'staff:view', description: 'View staff' },
  { code: 'staff:manage', description: 'Add/Remove staff' },
  { code: 'settings:manage', description: 'Manage tenant settings' },
];

// 2. System Roles with their Permissions
const systemRoles = [
  {
    name: 'owner',
    permissions: ['*'], // Owner gets everything
  },
  {
    name: 'manager',
    permissions: [
      'customer:view', 'customer:create', 'customer:update',
      'delivery:view', 'delivery:create', 'delivery:update',
      'staff:view', 'staff:manage', 'invoice:view', 'payment:collect'
    ],
  },
  {
    name: 'accountant',
    permissions: ['invoice:view', 'invoice:create', 'payment:collect', 'customer:view'],
  },
  {
    name: 'driver',
    permissions: ['delivery:view'],
  },
  {
    name: 'delivery_man',
    permissions: ['delivery:view', 'delivery:create','customer:view'],
  },
];

async function main() {
  console.log('🌱 Seeding permissions...');
  
  // 1. Insert all permissions
  for (const p of permissions) {
    await prisma.permission.upsert({
      where: { code: p.code },
      update: {},
      create: p,
    });
  }
  
  console.log('🌱 Seeding system roles...');

  // 2. Insert system roles and map permissions
  for (const roleData of systemRoles) {
    // Role create karo (agar pehle se nahi hai)
    const role = await prisma.role.upsert({
      where: { 
        // Note: Since tenant_id is null for system roles, we can't use @@unique directly. 
        // We need to find manually.
        id: 'dummy-id' // Hack: if we pass dummy id, it'll try to create. We need to find first.
      },
      update: {},
      create: {
        name: roleData.name,
        isSystem: true,
        tenantId: null,
      },
    });

    // Wait, the above hack won't work well. Let's do it properly:
  }
}

// Properly written seed logic
async function properSeed() {
  console.log('🌱 Seeding permissions...');
  for (const p of permissions) {
    await prisma.permission.upsert({
      where: { code: p.code },
      update: {},
      create: p,
    });
  }

  console.log('🌱 Seeding system roles...');
  for (const roleData of systemRoles) {
    // Find if role exists
    let role = await prisma.role.findFirst({
      where: { name: roleData.name, isSystem: true },
    });

    if (!role) {
      role = await prisma.role.create({
        data: {
          name: roleData.name,
          isSystem: true,
        },
      });
    }

    // Now map permissions
    if (roleData.permissions.includes('*')) {
      // Owner gets all permissions (we'll just give all)
      const allPerms = await prisma.permission.findMany();
      for (const p of allPerms) {
        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: role.id, permissionId: p.id } },
          update: {},
          create: { roleId: role.id, permissionId: p.id },
        });
      }
    } else {
      for (const permCode of roleData.permissions) {
        const perm = await prisma.permission.findUnique({ where: { code: permCode } });
        if (perm) {
          await prisma.rolePermission.upsert({
            where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
            update: {},
            create: { roleId: role.id, permissionId: perm.id },
          });
        }
      }
    }
  }

  console.log('✅ Seeding complete!');
}

properSeed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });