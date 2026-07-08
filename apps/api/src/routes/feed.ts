import { Router } from 'express';
import { requireAuth, optionalAuth } from '../middleware/auth';
import {
  getFeed,
  createPost,
  getPost,
  deletePost,
  likePost,
  unlikePost,
  bookmarkPost,
  unbookmarkPost,
  createComment,
  getComments,
  deleteComment,
} from '../controllers/feedController';

const router: Router = Router();

router.get('/', optionalAuth, getFeed);
router.post('/', requireAuth, createPost);
router.get('/:postId', optionalAuth, getPost);
router.delete('/:postId', requireAuth, deletePost);
router.post('/:postId/like', requireAuth, likePost);
router.delete('/:postId/like', requireAuth, unlikePost);
router.post('/:postId/bookmark', requireAuth, bookmarkPost);
router.delete('/:postId/bookmark', requireAuth, unbookmarkPost);
router.get('/:postId/comments', optionalAuth, getComments);
router.post('/:postId/comments', requireAuth, createComment);
router.delete('/:postId/comments/:commentId', requireAuth, deleteComment);

export default router;
