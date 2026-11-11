import { prisma, withTenantPrisma } from '@gasflow/db';
import { CreateCustomerDTO, UpdateCustomerDTO, CustomerQueryDTO } from './customer.dto';
import { ApiError } from '../../shared/utils/apiError';

export class CustomerService {
    // 1. Create Customer
    //   static async createCustomer(tenantId: string, data: CreateCustomerDTO) {
    //     // Check if phone number already exists for this tenant
    //     const existing = await prisma.customer.findFirst({
    //       where: { tenantId, phone: data.phone },
    //     });

    //     if (existing) {
    //       throw ApiError.conflict('Customer with this phone number already exists');
    //     }

    //     const customer = await prisma.customer.create({
    //       data: {
    //         tenantId,
    //         businessName: data.businessName,
    //         contactPerson: data.contactPerson || null,
    //         phone: data.phone,
    //         category: data.category,
    //         creditLimitPaise: BigInt(data.creditLimitPaise),
    //         openingBalancePaise: BigInt(data.openingBalancePaise),
    //       },
    //     });

    //     // BigInt ko JSON mein bhejne ke liye string mein convert karna padta hai
    //     return {
    //       ...customer,
    //       creditLimitPaise: customer.creditLimitPaise.toString(),
    //       openingBalancePaise: customer.openingBalancePaise.toString(),
    //     };
    //   }

    // 1. Create Customer
    static async createCustomer(tenantId: string, userId: string, data: CreateCustomerDTO) {
        // 👇 withTenantPrisma use karo
        return withTenantPrisma(tenantId, userId, async (tx) => {
            // Check duplicate
            const existing = await tx.customer.findFirst({
                where: { tenantId, phone: data.phone },
            });
            if (existing) throw ApiError.conflict('Customer with this phone number already exists');

            const customer = await tx.customer.create({
                data: {
                    tenantId,
                    businessName: data.businessName,
                    contactPerson: data.contactPerson || null,
                    phone: data.phone,
                    category: data.category,
                    creditLimitPaise: BigInt(data.creditLimitPaise),
                    openingBalancePaise: BigInt(data.openingBalancePaise),
                },
            });

            return {
                ...customer,
                creditLimitPaise: customer.creditLimitPaise.toString(),
                openingBalancePaise: customer.openingBalancePaise.toString(),
            };
        });
    }

    static async listCustomers(tenantId: string, userId: string, query: CustomerQueryDTO) {
        const { page, limit, search } = query;
        const skip = (page - 1) * limit;

        return withTenantPrisma(tenantId, userId, async (tx) => {

            // Search filter (tenantId ki zaroorat nahi, RLS khud handle karega)
            const whereClause: any = { isActive: true };

            if (search) {
                whereClause.OR = [
                    { businessName: { contains: search, mode: 'insensitive' } },
                    { phone: { contains: search } },
                    { contactPerson: { contains: search, mode: 'insensitive' } },
                ];
            }

            // Transaction ke andar queries chalao
            const [customers, total] = await Promise.all([
                tx.customer.findMany({
                    where: whereClause, // Yahan tenantId nahi hai!
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                }),
                tx.customer.count({ where: whereClause }),
            ]);

            // Format BigInts
            const formattedData = customers.map((c: any) => ({
                ...c,
                creditLimitPaise: c.creditLimitPaise.toString(),
                openingBalancePaise: c.openingBalancePaise.toString(),
            }));

            return {
                data: formattedData,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            };
        });
    }


    // 3. Get Customer By ID
    static async getCustomerById(tenantId: string, userId: string, customerId: string) {
        // 1. withTenantPrisma ke andar aao
        return withTenantPrisma(tenantId, userId, async (tx) => {

            // 2. Query mein SIRF customerId daalo, tenantId mat daalo!
            const customer = await tx.customer.findFirst({
                where: {
                    id: customerId,
                    isActive: true
                },
            });

            // 3. Agar customer nahi mila, toh error do
            if (!customer) {
                throw ApiError.notFound('Customer not found');
            }

            // 4. BigInt format karke return karo
            return {
                ...customer,
                creditLimitPaise: customer.creditLimitPaise.toString(),
                openingBalancePaise: customer.openingBalancePaise.toString(),
            };
        });
    }

    // 4. Update Customer
    static async updateCustomer(tenantId: string, userId: string, customerId: string, data: UpdateCustomerDTO) {
        return withTenantPrisma(tenantId, userId, async (tx) => {

            // 1. Pehle check karo (RLS khud batayega ki ye usi tenant ka hai ya nahi)
            const existing = await tx.customer.findFirst({
                where: { id: customerId },
            });
            if (!existing) throw ApiError.notFound('Customer not found');

            // 2. Update data object banao
            const updateData: any = {};
            if (data.businessName !== undefined) updateData.businessName = data.businessName;
            if (data.contactPerson !== undefined) updateData.contactPerson = data.contactPerson;
            if (data.phone !== undefined) updateData.phone = data.phone;
            if (data.category !== undefined) updateData.category = data.category;
            if (data.creditLimitPaise !== undefined) updateData.creditLimitPaise = BigInt(data.creditLimitPaise);

            // 3. Update karo (yahan bhi tenantId ki zaroorat nahi, kyunki RLS pehle hi check kar chuka hai)
            const updated = await tx.customer.update({
                where: { id: customerId },
                data: updateData,
            });

            return {
                ...updated,
                creditLimitPaise: updated.creditLimitPaise.toString(),
                openingBalancePaise: updated.openingBalancePaise.toString(),
            };
        });
    }

    // 5. Soft Delete Customer (Deactivate)
    static async deactivateCustomer(tenantId: string, userId: string, customerId: string) {
        await this.getCustomerById(tenantId, userId, customerId);

        await withTenantPrisma(tenantId, userId, async (tx) => {
            await tx.customer.update({
                where: { id: customerId },
                data: { isActive: false },
            });
        });

        return { message: 'Customer deactivated successfully' };
    }
}