import { Router } from 'express';
import * as auditLogController from '../controllers/auditLogController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, requireRole('ADMIN'));
router.get('/', auditLogController.list);

export default router;
