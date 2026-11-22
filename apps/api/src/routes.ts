import { Router } from 'express';
import roleRoutes from './modules/roles/role.routes';
import staffRoutes from './modules/staff/staff.routes';
import authRoutes from './modules/auth/auth.routes';
import { requireAuth } from './shared/middlewares/auth.middleware';
import customerRoutes from './modules/customers/customer.routes';
import tripRoutes from './modules/trips/trip.routes';
import deliveryRoutes from './modules/deliveries/delivery.routes';
import stockRoutes from './modules/stock/stock.routes';
import productRoutes from './modules/products/product.routes';

const router: Router = Router();

router.use('/auth', authRoutes);
router.use('/roles', roleRoutes);
router.use('/staff', staffRoutes);
router.use('/customers', customerRoutes);
router.use('/trips', tripRoutes);
router.use('/deliveries', deliveryRoutes);
router.use('/stock', stockRoutes);
router.use('/products', productRoutes);


export default router;