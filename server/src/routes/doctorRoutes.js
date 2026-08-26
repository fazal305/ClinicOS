import { Router } from 'express';
import * as doctorController from '../controllers/doctorController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.get('/', doctorController.list);
router.post('/', requireRole('ADMIN'), doctorController.create);
router.patch('/:id', requireRole('ADMIN'), doctorController.update);

export default router;
