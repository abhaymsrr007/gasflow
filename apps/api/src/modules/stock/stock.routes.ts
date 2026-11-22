import { Router } from 'express';
import { StockController } from './stock.controller';
import { authorize } from '../../shared/middlewares/authorize.middleware';

const router = Router();

/**
 * @swagger
 * /api/stock:
 *   get:
 *     summary: Get current stock levels
 *     tags: [Inventory]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Stock balances fetched successfully
 */
router.get('/', authorize('inventory:view'), StockController.getStock);

/**
 * @swagger
 * /api/stock/receipt:
 *   post:
 *     summary: Record a new stock receipt (Godown In)
 *     tags: [Inventory]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, filledQuantity, emptyQuantity]
 *             properties:
 *               productId: 
 *                 type: string
 *                 example: "uuid-of-cylinder-product"
 *               warehouseId: 
 *                 type: string
 *                 example: "00000000-0000-0000-0000-000000000000"
 *               filledQuantity: 
 *                 type: integer
 *                 example: 100
 *               emptyQuantity: 
 *                 type: integer
 *                 example: 50
 *     responses:
 *       201:
 *         description: Stock receipt recorded successfully
 *       400:
 *         description: Invalid input
 */
router.post('/receipt', authorize('inventory:update'), StockController.stockReceipt);

export default router;