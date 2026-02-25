import { Router } from 'express';
import TopicController from '../controllers/TopicController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', TopicController.index);
router.get('/:id', TopicController.show);
router.post('/', TopicController.store);
router.patch('/:id', TopicController.update);
router.delete('/:id', TopicController.delete);

export default router;
