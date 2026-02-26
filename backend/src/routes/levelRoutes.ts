import { Router } from 'express';
import LevelController from '../controllers/LevelController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', LevelController.index);
router.get('/:id', LevelController.show);
router.post('/', LevelController.store);
router.patch('/reorder', LevelController.reorder);
router.patch('/:id', LevelController.update);
router.delete('/:id', LevelController.delete);

export default router;
