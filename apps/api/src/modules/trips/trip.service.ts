import { withTenantPrisma } from '@gasflow/db';
import { CreateTripDTO } from './trip.dto';
import { ApiError } from '../../shared/utils/apiError';

export class TripService {
  static async createTrip(tenantId: string, userId: string, data: CreateTripDTO) {
    return withTenantPrisma(tenantId, userId, async (tx) => {
      // 1. Check Driver
      const driver = await tx.tenantMember.findFirst({
        where: { id: data.driverId, tenantId },
        include: { role: true },
      });
      if (!driver || driver.role.name !== 'driver') {
        throw ApiError.badRequest('Invalid driver selected');
      }

      // 2. Check Delivery Man
      const deliveryMan = await tx.tenantMember.findFirst({
        where: { id: data.deliveryManId, tenantId },
        include: { role: true },
      });
      if (!deliveryMan || deliveryMan.role.name !== 'delivery_man') {
        throw ApiError.badRequest('Invalid delivery man selected');
      }

      // 3. Stock Check (Filled Cylinders in Godown)
      // Hum maan rahe hain ki ek default product/warehouse hai. Future mein ye dynamic hoga.
      const product = await tx.cylinderProduct.findFirst({ where: { tenantId } });
      if (!product) throw ApiError.badRequest('No cylinder product found. Please add a product first.');

      const defaultWarehouseId = '00000000-0000-0000-0000-000000000000'; // Temporary default

      const stock = await tx.stockBalance.findUnique({
        where: {
          tenantId_productId_warehouseId: {
            tenantId,
            productId: product.id,
            warehouseId: defaultWarehouseId,
          },
        },
      });

      if (!stock || stock.filledQuantity < data.totalLoaded) {
        throw ApiError.badRequest(`Insufficient stock! Only ${stock?.filledQuantity || 0} filled cylinders available.`);
      }

      // 4. Trip banao
      const trip = await tx.trip.create({
        data: {
          tenantId,
          vehicleNumber: data.vehicleNumber,
          driverId: data.driverId,
          deliveryManId: data.deliveryManId,
          totalLoaded: data.totalLoaded,
          status: 'active',
        },
      });

      // 5. Godown se stock minus karo
      await tx.stockBalance.update({
        where: {
          tenantId_productId_warehouseId: {
            tenantId,
            productId: product.id,
            warehouseId: defaultWarehouseId,
          },
        },
        data: {
          filledQuantity: { decrement: data.totalLoaded },
        },
      });

      // 6. Ledger (stock_movements) mein entry karo
      await tx.stockMovement.create({
        data: {
          tenantId,
          productId: product.id,
          warehouseId: defaultWarehouseId,
          movementType: 'trip_load',
          quantity: -data.totalLoaded, // Negative kyunki stock minus ho raha hai
          referenceId: trip.id,
          referenceType: 'trip',
          createdBy: userId,
          notes: `Loaded ${data.totalLoaded} cylinders into Trip ${trip.id}`,
        },
      });

      return trip;
    });
  }

  static async listActiveTrips(tenantId: string, userId: string) {
    return withTenantPrisma(tenantId, userId, async (tx) => {
      return tx.trip.findMany({
        where: { status: 'active' },
        orderBy: { createdAt: 'desc' },
      });
    });
  }

  static async endTrip(tenantId: string, userId: string, tripId: string, actualRemaining: number) {
    return withTenantPrisma(tenantId, userId, async (tx) => {
      // 1. Trip check karo
      const trip = await tx.trip.findFirst({
        where: { id: tripId, tenantId, status: 'active' },
      });
      if (!trip) throw ApiError.badRequest('Active trip not found');

      // 2. Expected Remaining nikalo
      // Note: Abhi delivery table se delivered count nikal rahe hain
      const deliveries = await tx.delivery.aggregate({
        where: { tripId },
        _sum: { filledOut: true },
      });

      const totalDelivered = deliveries._sum.filledOut || 0;
      const expectedRemaining = trip.totalLoaded - totalDelivered;

      // 3. Discrepancy check karo
      const discrepancy = actualRemaining - expectedRemaining;
      if (discrepancy < 0) {
        // Matlab 3 cylinder missing hain
        console.warn(`Discrepancy Alert: Trip ${tripId} is missing ${Math.abs(discrepancy)} cylinders.`);
        // Future mein manager ko alert bhejenge
      }

      // 4. Trip status update karo
      const updatedTrip = await tx.trip.update({
        where: { id: tripId },
        data: {
          status: 'completed',
          endedAt: new Date(),
        },
      });

      // 5. Stock wapas godown mein daalo (agar kuch bacha hai)
      if (actualRemaining > 0) {
        const product = await tx.cylinderProduct.findFirst({ where: { tenantId } });
        if (!product) throw ApiError.badRequest('Product not found');
        const defaultWarehouseId = '00000000-0000-0000-0000-000000000000';

        // Stock balance update karo
        // await tx.stockBalance.update({
        //   where: {
        //     tenantId_productId_warehouseId: {
        //       tenantId,
        //       productId: product.id,
        //       warehouseId: defaultWarehouseId,
        //     },
        //   },
        //   data: { filledQuantity: { increment: actualRemaining } },
        // });

        await tx.stockBalance.upsert({
          where: {
            tenantId_productId_warehouseId: {
              tenantId,
              productId: product.id,
              warehouseId: defaultWarehouseId,
            },
          },
          update: {
            filledQuantity: { increment: actualRemaining },
          },
          create: {
            tenantId,
            productId: product.id,
            warehouseId: defaultWarehouseId,
            filledQuantity: actualRemaining,
            emptyQuantity: 0,
            damagedQuantity: 0,
            missingQuantity: 0,
          },
        });

        // Movement ledger mein entry karo
        await tx.stockMovement.create({
          data: {
            tenantId,
            productId: product.id,
            warehouseId: defaultWarehouseId,
            movementType: 'trip_return',
            quantity: actualRemaining,
            referenceId: tripId,
            referenceType: 'trip',
            createdBy: userId,
            notes: `Returned ${actualRemaining} cylinders from Trip ${tripId}`,
          },
        });
      }

      return {
        trip: updatedTrip,
        expectedRemaining,
        actualRemaining,
        discrepancy,
        message: discrepancy !== 0
          ? `Trip ended with discrepancy of ${discrepancy} cylinders`
          : 'Trip ended successfully. Stock matched.',
      };
    });
  }

  static async listCompletedTrips(tenantId: string, userId: string) {
  return withTenantPrisma(tenantId, userId, async (tx) => {
    return tx.trip.findMany({
      where: { status: 'completed' },  
      orderBy: { endedAt: 'desc' },    
    });
  });
}
}