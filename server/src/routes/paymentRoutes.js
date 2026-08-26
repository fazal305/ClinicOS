import { Router } from 'express';
import * as paymentController from '../controllers/paymentController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.get('/', requireRole('ADMIN', 'RECEPTIONIST', 'PATIENT'), paymentController.list);
router.post('/', requireRole('ADMIN', 'RECEPTIONIST'), paymentController.create);
router.get('/:id', requireRole('ADMIN', 'RECEPTIONIST', 'PATIENT'), paymentController.getById);
router.patch('/:id/status', requireRole('ADMIN', 'RECEPTIONIST'), paymentController.updateStatus);

export default router;
