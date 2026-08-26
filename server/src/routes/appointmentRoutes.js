import { Router } from 'express';
import * as appointmentController from '../controllers/appointmentController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', requireRole('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT'), appointmentController.list);
router.post('/', requireRole('ADMIN', 'RECEPTIONIST'), appointmentController.create);
router.get('/:id', requireRole('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT'), appointmentController.getById);
router.patch('/:id', requireRole('ADMIN', 'RECEPTIONIST'), appointmentController.reschedule);
router.patch(
  '/:id/status',
  requireRole('ADMIN', 'RECEPTIONIST', 'DOCTOR'),
  appointmentController.updateStatus
);

export default router;
