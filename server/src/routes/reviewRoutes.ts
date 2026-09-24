import { Router } from 'express';
import { createReview, getUserReviews } from '../controllers/reviewController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.get('/user/:userId', getUserReviews);
router.post('/', authenticate, createReview);

export default router;
