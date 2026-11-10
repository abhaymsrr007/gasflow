import { Router } from 'express';
import { CustomerController } from './customer.controller';
import { requireAuth } from '../../shared/middlewares/auth.middleware';
import { authorize } from '../../shared/middlewares/authorize.middleware';

const router = Router();

// Sabhi routes par authentication zaroori hai
router.use(requireAuth);

/**
 * @swagger
 * /api/customers:
 *   post:
 *     summary: Create a new customer
 *     tags: [Customers]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [businessName, phone, category]
 *             properties:
 *               businessName: { type: string, example: "Sharma Bhojnalaya" }
 *               contactPerson: { type: string, example: "Ramesh Sharma" }
 *               phone: { type: string, example: "9876543210" }
 *               category: { type: string, enum: [restaurant, hotel, dhaba, cafe, caterer, other] }
 *               creditLimitPaise: { type: number, example: 500000 }
 *               openingBalancePaise: { type: number, example: 0 }
 *     responses:
 *       201:
 *         description: Customer created
 */
router.post('/', authorize('customer:create'), CustomerController.create);

/**
 * @swagger
 * /api/customers:
 *   get:
 *     summary: List all customers with pagination and search
 *     tags: [Customers]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Customer list
 */
router.get('/', authorize('customer:view'), CustomerController.list);

/**
 * @swagger
 * /api/customers/{id}:
 *   get:
 *     summary: Get a single customer by ID
 *     tags: [Customers]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Customer details
 */
router.get('/:id', authorize('customer:view'), CustomerController.getById);

/**
 * @swagger
 * /api/customers/{id}:
 *   put:
 *     summary: Update a customer
 *     tags: [Customers]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Customer updated
 */
router.put('/:id', authorize('customer:update'), CustomerController.update);

/**
 * @swagger
 * /api/customers/{id}:
 *   delete:
 *     summary: Deactivate a customer
 *     tags: [Customers]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Customer deactivated
 */
router.delete('/:id', authorize('customer:delete'), CustomerController.deactivate);

export default router;