import { Router } from 'express';
import {
  getSafeMeetupSpots,
  getTransactionByConversation,
  updateMeetupSpot,
  confirmHandoff,
  cancelTransaction,
} from '../controllers/transactionController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

// Publicly accessible safe spots list
router.get('/spots', getSafeMeetupSpots);

// Authenticated transaction endpoints
router.use(authenticate);
router.get('/conversation/:conversationId', getTransactionByConversation);
router.post('/:id/meetup', updateMeetupSpot);
router.post('/:id/confirm', confirmHandoff);
router.post('/:id/cancel', cancelTransaction);

export default router;
