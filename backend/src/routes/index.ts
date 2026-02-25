import { Router } from 'express';
import authRoutes from './authRoutes';
import examRoutes from './examRoutes';
import topicRoutes from './topicRoutes';
import levelRoutes from './levelRoutes';
import questionRoutes from './questionRoutes';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

router.use('/auth', authRoutes);
router.use('/exams', examRoutes);
router.use('/topics', topicRoutes);
router.use('/levels', levelRoutes);
router.use('/questions', questionRoutes);

export default router;
