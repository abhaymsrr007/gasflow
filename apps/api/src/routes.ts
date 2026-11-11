import { Router } from 'express';
import roleRoutes from './modules/roles/role.routes';
import staffRoutes from './modules/staff/staff.routes';
import authRoutes from './modules/auth/auth.routes';
import { authorize } from './shared/middlewares/authorize.middleware';
import { requireAuth } from './shared/middlewares/auth.middleware';
import customerRoutes from './modules/customers/customer.routes';
import tripRoutes from './modules/trips/trip.routes';

const router: Router = Router();

router.use('/auth', authRoutes);
router.use('/roles', requireAuth, roleRoutes);
router.use('/staff', requireAuth, staffRoutes);
router.use('/customers', requireAuth, customerRoutes);
router.use('/trips', requireAuth, tripRoutes);


export default router;