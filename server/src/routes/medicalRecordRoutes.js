import { Router } from 'express';
import * as medicalRecordController from '../controllers/medicalRecordController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', requireRole('ADMIN', 'DOCTOR', 'PATIENT'), medicalRecordController.list);
router.post('/', requireRole('DOCTOR'), medicalRecordController.create);
router.get('/:id', requireRole('ADMIN', 'DOCTOR', 'PATIENT'), medicalRecordController.getById);

export default router;
