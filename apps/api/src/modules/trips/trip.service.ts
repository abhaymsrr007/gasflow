import { withTenantPrisma } from '@gasflow/db';
import { CreateTripDTO } from './trip.dto';
import { ApiError } from '../../shared/utils/apiError';

export class TripService {
  static async createTrip(tenantId: string, userId: string, data: CreateTripDTO) {
    return withTenantPrisma(tenantId, userId, async (tx) => {
      // 1. Check karo ki Driver aur Delivery Man exist karte hain aur isi tenant ke hain
      const driver = await tx.tenantMember.findFirst({
        where: { id: data.driverId, tenantId },
        include: { role: true },
      });
      if (!driver || driver.role.name !== 'driver') {
        throw ApiError.badRequest('Invalid driver selected');
      }

      const deliveryMan = await tx.tenantMember.findFirst({
        where: { id: data.deliveryManId, tenantId },
        include: { role: true },
      });
      if (!deliveryMan || deliveryMan.role.name !== 'delivery_man') {
        throw ApiError.badRequest('Invalid delivery man selected');
      }

      // 2. Trip banao
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

      // 3. Godown se stock minus karo (Note: Abhi humne stock_balances table use nahi kiya hai, ye future ka kaam hai)
      // Filhal hum log sirf Trip create kar rahe hain.

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
}