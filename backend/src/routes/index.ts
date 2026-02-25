import { Router } from 'express';
import authRoutes from './authRoutes';
import examRoutes from './examRoutes';
import topicRoutes from './topicRoutes';
import levelRoutes from './levelRoutes';
import questionRoutes from './questionRoutes';
import uploadRoutes from './uploadRoutes';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

router.use('/auth', authRoutes);
router.use('/exams', examRoutes);
router.use('/topics', topicRoutes);
router.use('/levels', levelRoutes);
router.use('/questions', questionRoutes);
router.use('/upload', uploadRoutes);

export default router;
