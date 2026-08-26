import { Router } from 'express';
import * as departmentController from '../controllers/departmentController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.get('/', departmentController.list);
router.post('/', requireRole('ADMIN'), departmentController.create);
router.patch('/:id', requireRole('ADMIN'), departmentController.update);

export default router;
