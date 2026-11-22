import { Router } from 'express';
import { DeliveryController } from './delivery.controller';
import { requireAuth } from '../../shared/middlewares/auth.middleware';
import { authorize } from '../../shared/middlewares/authorize.middleware';

const router = Router();
router.use(requireAuth);

/**
 * @swagger
 * /api/deliveries:
 *   post:
 *     summary: Complete a new delivery
 *     tags: [Deliveries]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tripId, customerId, filledOut, emptyIn]
 *             properties:
 *               tripId: { type: string }
 *               customerId: { type: string }
 *               filledOut: { type: number, example: 4 }
 *               emptyIn: { type: number, example: 3 }
 *               paymentType: { type: string, enum: [cash, online, pending] }
 *               applyDiscount: { type: boolean, example: true }
 *     responses:
 *       201:
 *         description: Delivery completed
 */
router.post('/', authorize('delivery:create'), DeliveryController.create);

export default router;