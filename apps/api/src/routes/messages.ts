import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  markAsRead,
  getUnreadCount,
} from '../controllers/messageController';

const router: Router = Router();

router.use(requireAuth);

router.get('/unread-count', getUnreadCount);
router.get('/conversations', getConversations);
router.post('/conversations', getOrCreateConversation);
router.get('/conversations/:conversationId/messages', getMessages);
router.post('/conversations/:conversationId/messages', sendMessage);
router.put('/conversations/:conversationId/read', markAsRead);

export default router;
