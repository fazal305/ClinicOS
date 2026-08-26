import { Router } from 'express';
import * as patientController from '../controllers/patientController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', requireRole('ADMIN', 'DOCTOR', 'RECEPTIONIST'), patientController.list);
router.post('/', requireRole('ADMIN', 'RECEPTIONIST'), patientController.register);
router.get('/me', requireRole('PATIENT'), patientController.getOwn);
router.get('/:id', requireRole('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT'), patientController.getById);
router.patch('/:id', requireRole('ADMIN', 'RECEPTIONIST'), patientController.update);

export default router;
