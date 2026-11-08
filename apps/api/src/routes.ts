import { Router } from 'express';
import roleRoutes from './modules/roles/role.routes'; 
import staffRoutes from './modules/staff/staff.routes';
import authRoutes from './modules/auth/auth.routes';
import { authorize } from './shared/middlewares/authorize.middleware';
import { requireAuth } from './shared/middlewares/auth.middleware';

const router: Router = Router();

router.use('/auth', authRoutes);
router.use('/roles', roleRoutes); 
router.use('/staff',requireAuth,authorize("staff:manage"), staffRoutes); 


export default router;