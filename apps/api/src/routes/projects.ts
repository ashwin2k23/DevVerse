import { Router } from 'express';
import { requireAuth, optionalAuth } from '../middleware/auth';
import {
  getProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  likeProject,
  unlikeProject,
  bookmarkProject,
  unbookmarkProject,
} from '../controllers/projectController';

const router: Router = Router();

router.get('/', optionalAuth, getProjects);
router.post('/', requireAuth, createProject);
router.get('/:projectId', optionalAuth, getProject);
router.put('/:projectId', requireAuth, updateProject);
router.delete('/:projectId', requireAuth, deleteProject);
router.post('/:projectId/like', requireAuth, likeProject);
router.delete('/:projectId/like', requireAuth, unlikeProject);
router.post('/:projectId/bookmark', requireAuth, bookmarkProject);
router.delete('/:projectId/bookmark', requireAuth, unbookmarkProject);

export default router;
