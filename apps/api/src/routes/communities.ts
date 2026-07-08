import { Router } from 'express';
import { requireAuth, optionalAuth } from '../middleware/auth';
import {
  getCommunities,
  createCommunity,
  getCommunity,
  updateCommunity,
  joinCommunity,
  leaveCommunity,
  getCommunityPosts,
  getCommunityMembers,
} from '../controllers/communityController';

const router: Router = Router();

router.get('/', optionalAuth, getCommunities);
router.post('/', requireAuth, createCommunity);
router.get('/:slug', optionalAuth, getCommunity);
router.put('/:communityId', requireAuth, updateCommunity);
router.post('/:communityId/join', requireAuth, joinCommunity);
router.delete('/:communityId/leave', requireAuth, leaveCommunity);
router.get('/:slug/posts', optionalAuth, getCommunityPosts);
router.get('/:slug/members', optionalAuth, getCommunityMembers);

export default router;
