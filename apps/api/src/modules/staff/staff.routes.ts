import { Router } from 'express';
import { StaffController } from './staff.controller';
import { requireAuth } from '../../shared/middlewares/auth.middleware';
import { authorize } from '../../shared/middlewares/authorize.middleware';

const router = Router();

/**
 * @swagger
 * /api/staff:
 *   post:
 *     summary: Add a new staff member
 *     tags: [Staff]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, roleName]
 *             properties:
 *               fullName: { type: string, example: "Ramesh Driver" }
 *               email: { type: string, example: "ramesh@agency.com" }
 *               phone: { type: string, example: "9876543210" }
 *               roleName: { type: string, enum: [manager, accountant, driver, delivery_man] }
 *               password: { type: string, example: "Password@123" }
 *     responses:
 *       201:
 *         description: Staff member created
 *       403:
 *         description: Forbidden (Insufficient permissions)
 */
router.post('/', requireAuth, authorize('staff:manage'), StaffController.create);
/**
 * @swagger
 * /api/staff:
 *   get:
 *     summary: Get a paginated list of staff members
 *     tags: [Staff]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or phone
 *     responses:
 *       200:
 *         description: Paginated staff list fetched
 */
router.get('/', authorize('staff:view'), StaffController.list);

/**
 * @swagger
 * /api/staff/{id}:
 *   put:
 *     summary: Update a staff member's details
 *     tags: [Staff]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName: { type: string }
 *               phone: { type: string }
 *               isActive: { type: boolean }
 *     responses:
 *       200:
 *         description: Staff updated
 *       404:
 *         description: Staff not found
 */
router.put('/:id', requireAuth, authorize('staff:manage'), StaffController.update);

/**
 * @swagger
 * /api/staff/{id}:
 *   delete:
 *     summary: Deactivate a staff member (soft delete)
 *     tags: [Staff]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Staff deactivated
 *       403:
 *         description: Only Owner can deactivate staff
 */
router.delete('/:id', requireAuth, authorize('staff:manage'), StaffController.deactivate);

export default router;