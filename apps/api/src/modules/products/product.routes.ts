import { Router } from 'express';
import { ProductController } from './product.controller';
import { requireAuth } from '../../shared/middlewares/auth.middleware';
import { authorize } from '../../shared/middlewares/authorize.middleware';

const router = Router();
router.use(requireAuth);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new cylinder product
 *     tags: [Products]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, sizeKg, defaultPricePaise]
 *             properties:
 *               name: { type: string, example: "19kg Commercial" }
 *               sizeKg: { type: number, example: 19.00 }
 *               defaultPricePaise: { type: number, example: 100000 }
 *     responses:
 *       201:
 *         description: Product created successfully
 */
router.post('/', authorize('settings:manage'), ProductController.create);

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: List all active products
 *     tags: [Products]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Products fetched
 */
router.get('/', ProductController.list);

export default router;