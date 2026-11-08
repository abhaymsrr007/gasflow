import { Router } from 'express';
import { RoleController } from './role.controller';
import { requireAuth } from '../../shared/middlewares/auth.middleware';

const router: Router = Router();

// Sirf logged-in user hi roles dekh ya bana sakta hai
router.use(requireAuth);

router.get('/', RoleController.list);
router.post('/', RoleController.create);

export default router;