import { Router } from 'express';
import authRoutes from './authRoutes.js';
import patientRoutes from './patientRoutes.js';
import departmentRoutes from './departmentRoutes.js';
import doctorRoutes from './doctorRoutes.js';
import appointmentRoutes from './appointmentRoutes.js';
import medicalRecordRoutes from './medicalRecordRoutes.js';
import prescriptionRoutes from './prescriptionRoutes.js';
import receptionistRoutes from './receptionistRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import reportRoutes from './reportRoutes.js';
import auditLogRoutes from './auditLogRoutes.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok' }, error: null });
});

router.use('/auth', authRoutes);
router.use('/patients', patientRoutes);
router.use('/departments', departmentRoutes);
router.use('/doctors', doctorRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/medical-records', medicalRecordRoutes);
router.use('/prescriptions', prescriptionRoutes);
router.use('/receptionists', receptionistRoutes);
router.use('/payments', paymentRoutes);
router.use('/reports', reportRoutes);
router.use('/audit-logs', auditLogRoutes);

export default router;
