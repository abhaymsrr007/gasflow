import { Router, Request, Response } from 'express';
import type { Router as ExpressRouter } from 'express';
import argon2 from 'argon2';
import { z } from 'zod';
// import { prisma } from '@gasflow/db'; 
import { prisma } from '../../../../packages/db/src/prisma';

const router: ExpressRouter = Router();

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
});

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - fullName
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               fullName:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid input
 */

router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, fullName } = signupSchema.parse(req.body);

    // Ab prisma.user standard tarike se kaam karega
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: Number(process.env['ARGON2_MEMORY_KIB']) || 65536,
      timeCost: Number(process.env['ARGON2_TIME_COST']) || 3,
      parallelism: Number(process.env['ARGON2_PARALLELISM']) || 1,
    });

    const user = await prisma.user.create({
      data: { email, passwordHash, fullName },
    });

    res.status(201).json({ message: 'User created successfully', userId: user.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;