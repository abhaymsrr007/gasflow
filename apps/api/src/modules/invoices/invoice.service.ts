import { withTenantPrisma } from '@gasflow/db';
import { ApiError } from '../../shared/utils/apiError';

// Interface define kar rahe hain parameters ke liye
interface RecordPaymentParams {
  invoiceId: string;
  amountPaise: number;
  paymentMethod: 'cash' | 'online';
}

export class InvoiceService {
  // 1. Create Invoice from Delivery
  static async createFromDelivery(tenantId: string, userId: string, deliveryId: string) {
    return withTenantPrisma(tenantId, userId, async (tx) => {
      const delivery = await tx.delivery.findFirst({
        where: { id: deliveryId, tenantId },
      });
      if (!delivery) throw ApiError.badRequest('Delivery not found');

      const existingInvoice = await tx.invoice.findFirst({ where: { deliveryId } });
      if (existingInvoice) throw ApiError.conflict('Invoice already exists for this delivery');

      const count = await tx.invoice.count({ where: { tenantId } });
      const invoiceNumber = `INV-${new Date().getFullYear()}-${(count + 1).toString().padStart(3, '0')}`;

      const subTotal = delivery.totalAmountPaise;
      const discount = delivery.discountPaise;
      const total = delivery.finalAmountPaise;
      const tax = 0n;

      const product = await tx.cylinderProduct.findFirst({ where: { tenantId } });
      if (!product) throw ApiError.badRequest('Product not found');

      const invoice = await tx.invoice.create({
        data: {
          tenantId,
          invoiceNumber,
          customerId: delivery.customerId,
          deliveryId: delivery.id,
          subTotalPaise: subTotal,
          taxPaise: tax,
          discountPaise: discount,
          totalPaise: total,
          status: 'posted',
          postedAt: new Date(),
          items: {
            create: {
              productId: product.id,
              quantity: delivery.filledOut,
              unitPricePaise: delivery.filledOut > 0 ? subTotal / BigInt(delivery.filledOut) : 0n,
              totalPaise: subTotal,
            },
          },
        },
        include: { items: true },
      });

      return {
        ...invoice,
        subTotalPaise: invoice.subTotalPaise.toString(),
        taxPaise: invoice.taxPaise.toString(),
        discountPaise: invoice.discountPaise.toString(),
        totalPaise: invoice.totalPaise.toString(),
        items: invoice.items.map(i => ({
          ...i,
          unitPricePaise: i.unitPricePaise.toString(),
          totalPaise: i.totalPaise.toString(),
        })),
      };
    });
  }

  // 2. List Invoices
  static async listInvoices(tenantId: string, userId: string, page: number, limit: number, search?: string) {
    return withTenantPrisma(tenantId, userId, async (tx) => {
      const skip = (page - 1) * limit;

      const whereClause: any = { tenantId };
      if (search) {
        whereClause.OR = [
          { invoiceNumber: { contains: search, mode: 'insensitive' } },
          { customer: { businessName: { contains: search, mode: 'insensitive' } } },
        ];
      }

      const [invoices, total] = await Promise.all([
        tx.invoice.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: { customer: { select: { businessName: true } } },
        }),
        tx.invoice.count({ where: whereClause }),
      ]);

      return {
        data: invoices.map(inv => ({
          ...inv,
          subTotalPaise: inv.subTotalPaise.toString(),
          taxPaise: inv.taxPaise.toString(),
          discountPaise: inv.discountPaise.toString(),
          totalPaise: inv.totalPaise.toString(),
        })),
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      };
    });
  }

  // 3. Get Invoice Detail
  static async getInvoiceDetail(tenantId: string, userId: string, invoiceId: string) {
    return withTenantPrisma(tenantId, userId, async (tx) => {
      const invoice = await tx.invoice.findFirst({
        where: { id: invoiceId, tenantId },
        include: {
          customer: true,
          items: { include: { product: { select: { name: true } } } },
        },
      });

      if (!invoice) throw ApiError.notFound('Invoice not found');

      return {
        ...invoice,
        subTotalPaise: invoice.subTotalPaise.toString(),
        taxPaise: invoice.taxPaise.toString(),
        discountPaise: invoice.discountPaise.toString(),
        totalPaise: invoice.totalPaise.toString(),
        items: invoice.items.map(i => ({
          ...i,
          unitPricePaise: i.unitPricePaise.toString(),
          totalPaise: i.totalPaise.toString(),
        })),
      };
    });
  }

  // 4. Record Payment
  static async recordPayment(tenantId: string, userId: string, data: RecordPaymentParams) {
    return withTenantPrisma(tenantId, userId, async (tx) => {
      const invoice = await tx.invoice.findFirst({
        where: { id: data.invoiceId, tenantId, status: { in: ['draft', 'posted'] } },
      });

      if (!invoice) throw ApiError.badRequest('Invoice not found or already paid');
      
      const paymentAmount = BigInt(data.amountPaise);
      if (paymentAmount > invoice.totalPaise) {
        throw ApiError.badRequest('Payment amount exceeds invoice total');
      }

      // Agar poora payment ho gaya hai, toh status 'paid' mark karo
      if (paymentAmount === invoice.totalPaise) {
        await tx.invoice.update({
          where: { id: data.invoiceId },
          data: { status: 'paid' },
        });
      }

      // Future mein yahan Payment table mein entry hogi

      return { message: 'Payment recorded successfully', status: 'paid' };
    });
  }
}