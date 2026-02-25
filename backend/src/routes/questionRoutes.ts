import { Router } from 'express';
import QuestionController from '../controllers/QuestionController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', QuestionController.index);
router.get('/:id', QuestionController.show);
router.post('/', QuestionController.store);
router.patch('/:id', QuestionController.update);
router.delete('/:id', QuestionController.delete);

export default router;
