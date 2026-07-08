import { Router } from 'express';
import { requireAuth, optionalAuth } from '../middleware/auth';
import {
  getEvents,
  createEvent,
  getEvent,
  registerForEvent,
  unregisterFromEvent,
  bookmarkEvent,
  unbookmarkEvent,
} from '../controllers/eventController';

const router: Router = Router();

router.get('/', optionalAuth, getEvents);
router.post('/', requireAuth, createEvent);
router.get('/:eventId', optionalAuth, getEvent);
router.post('/:eventId/register', requireAuth, registerForEvent);
router.delete('/:eventId/register', requireAuth, unregisterFromEvent);
router.post('/:eventId/bookmark', requireAuth, bookmarkEvent);
router.delete('/:eventId/bookmark', requireAuth, unbookmarkEvent);

export default router;
