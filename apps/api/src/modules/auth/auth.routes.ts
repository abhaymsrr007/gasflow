import { Router } from 'express';
import { AuthController } from './auth.controller';

const router: Router = Router();

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user and create their agency (3-day trial)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, fullName, agencyName]
 *             properties:
 *               email: 
 *                 type: string 
 *                 format: email
 *               password: 
 *                 type: string 
 *                 minLength: 8
 *               fullName: 
 *                 type: string
 *               agencyName: 
 *                 type: string
 *           example:
 *             email: "owner@sharmagas.com"
 *             password: "Password@123"
 *             fullName: "Ramesh Sharma"
 *             agencyName: "Sharma Gas Agency"
 *     responses:
 *       201:
 *         description: User registered and agency created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         userId: 
 *                           type: string
 *                           example: '123e4567-e89b-12d3-a456-426614174000'
 *                         tenantId:
 *                           type: string
 *                           example: '987fcdeb-51a2-43d7-9012-345678901234'
 *       400:
 *         description: Validation Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/signup', AuthController.signup);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user and get JWT with permissions
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: "owner@sharmagas.com"
 *             password: "Password@123"
 *     responses:
 *       200:
 *         description: Logged in successfully
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: gasflow_sid=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         token:
 *                           type: string
 *                           example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
 *                         user:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             role:
 *                               type: string
 *                               example: 'owner'
 *                             tenantId:
 *                               type: string
 *                             permissions:
 *                               type: array
 *                               items:
 *                                 type: string
 *                               example: ["*"]
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/login', AuthController.login);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Get a new access token using refresh token
 *     tags: [Auth]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: Token refreshed
 */
router.post('/refresh', AuthController.refresh);
export default router;