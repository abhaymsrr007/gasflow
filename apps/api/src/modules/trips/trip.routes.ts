import { Router } from 'express';
import { TripController } from './trip.controller';
import { requireAuth } from '../../shared/middlewares/auth.middleware';
import { authorize } from '../../shared/middlewares/authorize.middleware';

const router = Router();
router.use(requireAuth);

/**
 * @swagger
 * /api/trips:
 *   post:
 *     summary: Create a new trip (Load vehicle)
 *     tags: [Trips]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [vehicleNumber, driverId, deliveryManId, totalLoaded]
 *             properties:
 *               vehicleNumber: { type: string, example: "MH-12-AB-1234" }
 *               driverId: { type: string }
 *               deliveryManId: { type: string }
 *               totalLoaded: { type: number, example: 60 }
 *     responses:
 *       201:
 *         description: Trip created
 */
router.post('/', authorize('delivery:create'), TripController.create);

/**
 * @swagger
 * /api/trips:
 *   get:
 *     summary: Get all active trips
 *     tags: [Trips]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of active trips
 */
router.get('/',authorize('delivery:view'), TripController.listActive);

export default router;