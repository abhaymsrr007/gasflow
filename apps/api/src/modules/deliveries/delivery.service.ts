import { prisma, withTenantPrisma } from '@gasflow/db';
import { CreateDeliveryDTO } from './delivery.dto';
import { ApiError } from '../../shared/utils/apiError';

export class DeliveryService {
  static async createDelivery(tenantId: string, userId: string, data: CreateDeliveryDTO) {
    return withTenantPrisma(tenantId, userId, async (tx) => {
    //   await prisma.delivery.findFirst({ where: { tripId: data.tripId, customerId: data.customerId } }).then((existingDelivery) => {
    //     if (existingDelivery) {
    //       throw ApiError.conflict('Delivery already exists for this trip and customer');
    //     }
      // 1. Trip check karo ki active hai ya nahi
      const trip = await tx.trip.findFirst({
        where: { id: data.tripId, status: 'active' },
      });
      if (!trip) throw ApiError.badRequest('Trip is not active or not found');

      // 2. Customer check karo
      const customer = await tx.customer.findFirst({
        where: { id: data.customerId, isActive: true },
      });
      if (!customer) throw ApiError.badRequest('Customer not found');

      // 3. Calculate Amount (Example: 1000 paise per cylinder)
      const pricePerCylinder = 100000n; // ₹1000 (paise mein)
      const totalAmount = BigInt(data.filledOut) * pricePerCylinder;

      // 4. Discount Logic (2% agar applyDiscount true hai)
      let discountAmount = 0n;
      if (data.applyDiscount) {
        discountAmount = (totalAmount * 2n) / 100n; // 2%
      }
      const finalAmount = totalAmount - discountAmount;

      // 5. Delivery Record banao
      const delivery = await tx.delivery.create({
        data: {
          tenantId,
          tripId: data.tripId,
          customerId: data.customerId,
          filledOut: data.filledOut,
          emptyIn: data.emptyIn,
          paymentStatus: data.paymentType === 'cash' ? 'paid_cash' : (data.paymentType === 'online' ? 'paid_online' : 'pending'),
          totalAmountPaise: totalAmount,
          discountPaise: discountAmount,
          finalAmountPaise: finalAmount,
          status: 'completed',
        },
      });

      // 6. Customer ka balance update karo (Stock custody)
      // Note: Abhi ke liye hum customer ke openingBalancePaise ko update kar rahe hain.
      // Actual system mein stock_balances table update hogi.
      await tx.customer.update({
        where: { id: data.customerId },
        data: {
          openingBalancePaise: customer.openingBalancePaise + (finalAmount - (data.paymentType === 'pending' ? 0n : finalAmount)),
        },
      });

      // 7. Return response
      return {
        ...delivery,
        totalAmountPaise: delivery.totalAmountPaise.toString(),
        discountPaise: delivery.discountPaise.toString(),
        finalAmountPaise: delivery.finalAmountPaise.toString(),
      };
    });
  }
}