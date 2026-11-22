import { PrismaClient } from './generated/client/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';  

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ab dotenv sahi se .env file dhoondh lega
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const pool = new pg.Pool({
  connectionString: process.env['DATABASE_URL_APP'],
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });

type TransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

// export async function withTenantPrisma<T>(
//   tenantId: string,
//   userId: string,
//   callback: (tx: TransactionClient) => Promise<T>
// ): Promise<T> {
//   return prisma.$transaction(async (tx) => {
//     await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;
//     await tx.$executeRaw`SELECT set_config('app.user_id', ${userId}, true)`;
//     return callback(tx);
//   });
// }

export async function withTenantPrisma<T>(
  tenantId: string,
  userId: string,
  callback: (tx: TransactionClient) => Promise<T>
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;
    await tx.$executeRaw`SELECT set_config('app.user_id', ${userId}, true)`;
    return callback(tx);
  });
}