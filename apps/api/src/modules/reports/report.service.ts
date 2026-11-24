import { withTenantPrisma } from '@gasflow/db';

export class ReportService {
    // 1. Aaj ki summary (Dashboard ke liye)
      static async getDashboardSummary(tenantId: string, userId: string) {
        return withTenantPrisma(tenantId, userId, async (tx) => {
          const todayStart = new Date();
          todayStart.setHours(0, 0, 0, 0);
          const todayEnd = new Date();
          todayEnd.setHours(23, 59, 59, 999);

          // Aaj ki deliveries
          const deliveries = await tx.delivery.aggregate({
            where: {
              createdAt: { gte: todayStart, lte: todayEnd },
              status: 'completed',
            },
            _count: { id: true },
            _sum: { filledOut: true, finalAmountPaise: true },
          });

          // Pending Payments (Total)
          const pendingAmount = await tx.delivery.aggregate({
            where: { paymentStatus: 'pending' },
            _sum: { finalAmountPaise: true },
          });

          // Active Trips
          const activeTrips = await tx.trip.count({ where: { status: 'active' } });

          return {
            today: {
              totalDeliveries: deliveries._count.id || 0,
              totalCylinders: deliveries._sum.filledOut || 0,
              totalSalesPaise: (deliveries._sum.finalAmountPaise || 0n).toString(),
            },
            pendingPaymentsPaise: (pendingAmount._sum.finalAmountPaise || 0n).toString(),
            activeTrips,
          };
        });
      }

    // static async getDashboardSummary(tenantId: string, userId: string, role: string) {
    //     return withTenantPrisma(tenantId, userId, async (tx) => {
    //         const todayStart = new Date();
    //         todayStart.setHours(0, 0, 0, 0);
    //         const todayEnd = new Date();
    //         todayEnd.setHours(23, 59, 59, 999);

    //         // Base filter: Sirf aaj ki completed deliveries
    //         const baseFilter: any = {
    //             createdAt: { gte: todayStart, lte: todayEnd },
    //             status: 'completed',
    //         };

    //         // 👇 Agar Delivery Man hai, toh sirf uski deliveries
    //         if (role === 'delivery_man') {
    //             // Delivery Man ki trip mein kaunsi delivery hui, wo nikalna padega
    //             // Filhal ke liye hum maan rahe hain ki delivery man ka koi direct field nahi hai.
    //             // Better approach: Trip ke through check karo
    //             const myTrips = await tx.trip.findMany({
    //                 where: { deliveryManId: userId, status: 'completed' },
    //                 select: { id: true },
    //             });
    //             const tripIds = myTrips.map(t => t.id);

    //             if (tripIds.length === 0) {
    //                 return {
    //                     today: { totalDeliveries: 0, totalCylinders: 0, totalSalesPaise: '0' },
    //                     pendingPaymentsPaise: '0',
    //                     activeTrips: 0,
    //                     isDeliveryMan: true,
    //                 };
    //             }

    //             baseFilter.tripId = { in: tripIds };
    //         }

    //         // Deliveries aggregate
    //         const deliveries = await tx.delivery.aggregate({
    //             where: baseFilter,
    //             _count: { id: true },
    //             _sum: { filledOut: true, finalAmountPaise: true },
    //         });

    //         // Pending Payments (sirf uski ya sabki, role ke hisaab se)
    //         const pendingFilter: any = { paymentStatus: 'pending' };
    //         if (role === 'delivery_man') {
    //             const myTrips = await tx.trip.findMany({
    //                 where: { deliveryManId: userId },
    //                 select: { id: true },
    //             });
    //             pendingFilter.tripId = { in: myTrips.map(t => t.id) };
    //         }

    //         const pendingAmount = await tx.delivery.aggregate({
    //             where: pendingFilter,
    //             _sum: { finalAmountPaise: true },
    //         });

    //         // Active Trips (sirf uski ya sabki)
    //         const activeTripFilter: any = { status: 'active' };
    //         if (role === 'delivery_man') {
    //             activeTripFilter.deliveryManId = userId;
    //         }
    //         const activeTrips = await tx.trip.count({ where: activeTripFilter });

    //         return {
    //             today: {
    //                 totalDeliveries: deliveries._count.id || 0,
    //                 totalCylinders: deliveries._sum.filledOut || 0,
    //                 totalSalesPaise: (deliveries._sum.finalAmountPaise || 0n).toString(),
    //             },
    //             pendingPaymentsPaise: (pendingAmount._sum.finalAmountPaise || 0n).toString(),
    //             activeTrips,
    //             isDeliveryMan: role === 'delivery_man',
    //         };
    //     });
    // }


  // 2. Date-wise Report (Custom Date Range)
  static async getDateWiseReport(tenantId: string, userId: string, from: string, to: string) {
    return withTenantPrisma(tenantId, userId, async (tx) => {
        const startDate = new Date(from);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(to);
        endDate.setHours(23, 59, 59, 999);

        // Raw SQL se group by date nikalna sabse fast hai
        const rawData = await tx.$queryRaw<any[]>`
        SELECT 
          DATE(created_at) as date,
          COUNT(id) as total_deliveries,
          SUM(filled_out) as total_cylinders,
          SUM(final_amount_paise) as total_sales_paise
        FROM deliveries
        WHERE tenant_id = ${tenantId}::uuid
          AND created_at >= ${startDate}
          AND created_at <= ${endDate}
          AND status = 'completed'
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at) DESC
      `;

        // BigInt format karo
        return rawData.map(row => ({
            date: row.date,
            totalDeliveries: Number(row.total_deliveries),
            totalCylinders: Number(row.total_cylinders),
            totalSalesPaise: row.total_sales_paise?.toString() || '0',
        }));
    });
}
}