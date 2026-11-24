import { withTenantPrisma } from '@gasflow/db';
import { CreateProductDTO } from './product.dto';

export class ProductService {
  static async createProduct(tenantId: string, userId: string, data: CreateProductDTO) {
    return withTenantPrisma(tenantId, userId, async (tx) => {
      // Prisma mein sizeKg Decimal hai, isliye string mein convert karke bhejte hain
      return tx.cylinderProduct.create({
        data: {
          tenantId,
          name: data.name,
          sizeKg: data.sizeKg.toString(),
          defaultPricePaise: BigInt(data.defaultPricePaise),
        },
      });
    });
  }

  static async listProducts(tenantId: string, userId: string) {
    return withTenantPrisma(tenantId, userId, async (tx) => {
      const products = await tx.cylinderProduct.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      });

      // BigInt format
      return products.map((p) => ({
        ...p,
        defaultPricePaise: p.defaultPricePaise.toString(),
        sizeKg: p.sizeKg.toString(),
      }));
    });
  }
}