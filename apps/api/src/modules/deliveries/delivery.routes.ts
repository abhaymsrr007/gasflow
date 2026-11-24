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

/**
 * @swagger
 * /api/deliveries/my:
 *   get:
 *     summary: Get deliveries for the logged-in Delivery Man
 *     tags: [Deliveries]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema: { type: string, format: date }
 *         description: Date (YYYY-MM-DD). Default is today.
 *     responses:
 *       200:
 *         description: List of deliveries
 */
router.get('/my', authorize('delivery:view'), DeliveryController.myDeliveries);

export default router;