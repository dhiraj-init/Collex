import { Router } from 'express';
import {
  getUserTrustProfile,
  createReport,
  getModerationQueue,
  resolveReport,
} from '../controllers/trustController';
import { authenticate, authorize } from '../middlewares/authMiddleware';

const router = Router();

// Publicly viewable student trust score and signals
router.get('/profile/:userId', getUserTrustProfile);

// Authenticated report creation
router.post('/reports', authenticate, createReport);

// Staff moderation queue
router.get(
  '/moderation',
  authenticate,
  authorize('MODERATOR', 'COLLEGE_ADMIN', 'SUPER_ADMIN'),
  getModerationQueue
);

router.post(
  '/moderation/:id/resolve',
  authenticate,
  authorize('MODERATOR', 'COLLEGE_ADMIN', 'SUPER_ADMIN'),
  resolveReport
);

export default router;
