import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import {
  createProposal,
  getMyProposals,
  respondToProposal,
} from '../controllers/exchangeController';

const router = Router();

// Require authentication for all exchange routes
router.use(authenticate);

// GET /api/v1/exchanges
router.get('/', getMyProposals);

// POST /api/v1/exchanges
router.post('/', createProposal);

// PATCH /api/v1/exchanges/:id/respond
router.patch('/:id/respond', respondToProposal);

export default router;
