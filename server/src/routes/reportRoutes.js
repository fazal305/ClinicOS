import { Router } from 'express';
import * as reportController from '../controllers/reportController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, requireRole('ADMIN'));
router.get('/overview', reportController.overview);

export default router;
