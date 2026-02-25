import { Router } from 'express';
import ExamController from '../controllers/ExamController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', ExamController.index);
router.get('/:id', ExamController.show);
router.post('/', ExamController.store);
router.patch('/:id', ExamController.update);
router.delete('/:id', ExamController.delete);

export default router;
