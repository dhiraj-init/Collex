import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import {
  createBundle,
  getBundles,
  getBundleById,
  deleteBundle,
} from '../controllers/bundleController';

const router = Router();

// GET /api/v1/bundles — public campus-scoped feed
router.get('/', getBundles);

// GET /api/v1/bundles/:id
router.get('/:id', getBundleById);

// POST /api/v1/bundles — authenticated
router.post('/', authenticate, createBundle);

// DELETE /api/v1/bundles/:id — seller or moderator
router.delete('/:id', authenticate, deleteBundle);

export default router;
