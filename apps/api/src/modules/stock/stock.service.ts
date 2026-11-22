import { withTenantPrisma } from '@gasflow/db';
import { StockReceiptDTO } from './stock.dto';

export class StockService {
  static async getStock(tenantId: string, userId: string) {
    return withTenantPrisma(tenantId, userId, async (tx) => {
      return tx.stockBalance.findMany({
        include: { product: { select: { name: true, sizeKg: true } } },
      });
    });
  }

  static async stockReceipt(tenantId: string, userId: string, data: StockReceiptDTO) {
    return withTenantPrisma(tenantId, userId, async (tx) => {
      // 1. Stock Balance update karo (Upsert logic)
      const balance = await tx.stockBalance.upsert({
        where: {
          tenantId_productId_warehouseId: {
            tenantId,
            productId: data.productId,
            warehouseId: data.warehouseId,
          },
        },
        update: {
          filledQuantity: { increment: data.filledQuantity },
          emptyQuantity: { increment: data.emptyQuantity },
        },
        create: {
          tenantId,
          productId: data.productId,
          warehouseId: data.warehouseId,
          filledQuantity: data.filledQuantity,
          emptyQuantity: data.emptyQuantity,
        },
      });

      // 2. Movement Ledger mein entry karo (Immutable)
      await tx.stockMovement.create({
        data: {
          tenantId,
          productId: data.productId,
          warehouseId: data.warehouseId,
          movementType: 'receipt',
          quantity: data.filledQuantity,
          createdBy: userId,
          notes: 'New stock received',
        },
      });

      return balance;
    });
  }
}