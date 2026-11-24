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


  static async getMyDeliveries(tenantId: string, userId: string, date?: string) {
  return withTenantPrisma(tenantId, userId, async (tx) => {
    // Agar date di gayi hai, toh us date ki deliveries, warna aaj ki
    // console.log('Fetching deliveries for user:', userId, 'on date:', date || 'today');
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // 1. User ki saari trips nikalo (jo usne delivery man ke roop mein ki hain)
    const trips = await tx.trip.findMany({
      where: {
        deliveryManId: userId,
        // Sirf aaj ki trips (ya jo date di gayi hai)
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
      select: { id: true },
    });

    const tripIds = trips.map(t => t.id);
    if (tripIds.length === 0) return [];

    // 2. Un trips mein jo deliveries hui hain, unki list nikalo
    const deliveries = await tx.delivery.findMany({
      where: {
        tripId: { in: tripIds },
        status: 'completed',
      },
      include: {
        customer: { select: { businessName: true, phone: true } },
        trip: { select: { vehicleNumber: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 3. Format karo
    return deliveries.map(d => ({
      id: d.id,
      customerName: d.customer.businessName,
      customerPhone: d.customer.phone,
      filledOut: d.filledOut,
      emptyIn: d.emptyIn,
      totalAmountPaise: d.totalAmountPaise.toString(),
      finalAmountPaise: d.finalAmountPaise.toString(),
      paymentStatus: d.paymentStatus,
      status: d.status,
      createdAt: d.createdAt,
      vehicleNumber: d.trip.vehicleNumber,
    }));
  });
}
}