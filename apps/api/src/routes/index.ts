import { Router } from 'express';
import userRoutes from './users';
import projectRoutes from './projects';
import feedRoutes from './feed';
import communityRoutes from './communities';
import eventRoutes from './events';
import messageRoutes from './messages';
import notificationRoutes from './notifications';
import { requireAuth } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { uploadFile } from '../controllers/uploadController';

const router: Router = Router();

router.use('/users', userRoutes);
router.use('/projects', projectRoutes);
router.use('/feed', feedRoutes);
router.use('/communities', communityRoutes);
router.use('/events', eventRoutes);
router.use('/messages', messageRoutes);
router.use('/notifications', notificationRoutes);

// ─── File Upload ─────────────────────────────────────────────────────────────
router.post('/upload', requireAuth, upload.single('file'), uploadFile);

export default router;
