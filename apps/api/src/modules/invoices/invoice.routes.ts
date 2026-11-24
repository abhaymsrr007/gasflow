import { Router } from 'express';
import { InvoiceController } from './invoice.controller';
import { requireAuth } from '../../shared/middlewares/auth.middleware';
import { authorize } from '../../shared/middlewares/authorize.middleware';

const router = Router();
router.use(requireAuth);

/**
 * @swagger
 * /api/invoices/from-delivery:
 *   post:
 *     summary: Generate invoice from a completed delivery
 *     tags: [Invoices]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [deliveryId]
 *             properties:
 *               deliveryId: 
 *                 type: string 
 *                 example: "uuid-of-delivery"
 *     responses:
 *       201:
 *         description: Invoice created successfully
 */
router.post('/from-delivery', authorize('invoice:create'), InvoiceController.createFromDelivery);

/**
 * @swagger
 * /api/invoices:
 *   get:
 *     summary: List all invoices with pagination and search
 *     tags: [Invoices]
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
 *         description: Search by invoice number or customer name
 *     responses:
 *       200:
 *         description: List of invoices
 */
router.get('/', authorize('invoice:view'), InvoiceController.list);

/**
 * @swagger
 * /api/invoices/{id}:
 *   get:
 *     summary: Get invoice details by ID
 *     tags: [Invoices]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Invoice details
 */
router.get('/:id', authorize('invoice:view'), InvoiceController.getById);

/**
 * @swagger
 * /api/invoices/{id}/payments:
 *   post:
 *     summary: Record a payment against an invoice
 *     tags: [Invoices]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amountPaise, paymentMethod]
 *             properties:
 *               amountPaise:
 *                 type: number
 *                 example: 392000
 *               paymentMethod:
 *                 type: string
 *                 enum: [cash, online]
 *     responses:
 *       200:
 *         description: Payment recorded successfully
 *       400:
 *         description: Invalid amount or invoice not found
 */
router.post('/:id/payments', authorize('payment:collect'), InvoiceController.recordPayment);

export default router;