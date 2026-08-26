import { Router } from 'express';
import * as receptionistController from '../controllers/receptionistController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, requireRole('ADMIN'));
router.get('/', receptionistController.list);
router.post('/', receptionistController.create);
router.patch('/:id', receptionistController.update);

export default router;
