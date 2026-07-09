import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, optionalAuth } from '../middleware/auth';
import {
  getProfile,
  getCurrentUserProfile,
  updateProfile,
  getFollowers,
  getFollowing,
  followUser,
  unfollowUser,
  acceptFollowRequest,
  declineFollowRequest,
  searchUsers,
  syncUser,
  getTrendingDevelopers,
  getSuggestedDevelopers,
  getBookmarks,
  getUserContributions,
} from '../controllers/userController';

const router: Router = Router();

router.post('/sync', requireAuth, syncUser);
router.get('/search', optionalAuth, searchUsers);
router.get('/trending', optionalAuth, getTrendingDevelopers);
router.get('/suggested', requireAuth, getSuggestedDevelopers);
router.get('/me/bookmarks', requireAuth, getBookmarks);
router.get('/me/profile', requireAuth, getCurrentUserProfile);
router.get('/:username', optionalAuth, getProfile);
router.get('/:username/contributions', optionalAuth, getUserContributions);
router.put('/me', requireAuth, updateProfile);
router.get('/:username/followers', optionalAuth, getFollowers);
router.get('/:username/following', optionalAuth, getFollowing);
router.post('/:userId/follow', requireAuth, followUser);
router.delete('/:userId/follow', requireAuth, unfollowUser);
router.put('/:userId/follow/accept', requireAuth, acceptFollowRequest);
router.delete('/:userId/follow/decline', requireAuth, declineFollowRequest);

export default router;

