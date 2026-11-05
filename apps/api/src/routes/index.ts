import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import authRoutes from './auth';
// import customerRoutes from './customers'; // Future mein aise add karna

const router: ExpressRouter = Router();

// Yahan saare routes ko mount karo
router.use('/auth', authRoutes);
// router.use('/customers', customerRoutes); // Future mein aise add karna

export default router;