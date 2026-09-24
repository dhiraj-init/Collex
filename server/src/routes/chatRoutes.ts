import { Router } from 'express';
import {
  getOrCreateConversation,
  getConversations,
  getMessages,
  blockConversation,
  reportConversation,
} from '../controllers/chatController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticate);

router.post('/conversations', getOrCreateConversation);
router.get('/conversations', getConversations);
router.get('/conversations/:id/messages', getMessages);
router.post('/conversations/:id/block', blockConversation);
router.post('/conversations/:id/report', reportConversation);

export default router;
