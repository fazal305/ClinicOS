import { Router } from 'express';
import * as prescriptionController from '../controllers/prescriptionController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', requireRole('ADMIN', 'DOCTOR', 'PATIENT'), prescriptionController.list);
router.post('/', requireRole('DOCTOR'), prescriptionController.create);
router.get('/:id', requireRole('ADMIN', 'DOCTOR', 'PATIENT'), prescriptionController.getById);

export default router;
