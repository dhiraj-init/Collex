import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import {
  createWantedPost,
  getWantedPosts,
  getWantedPostById,
  closeWantedPost,
  deleteWantedPost,
} from '../controllers/wantedController';

const router = Router();

// GET /api/v1/wanted — public campus-scoped feed
router.get('/', getWantedPosts);

// GET /api/v1/wanted/:id
router.get('/:id', getWantedPostById);

// POST /api/v1/wanted — authenticated
router.post('/', authenticate, createWantedPost);

// PATCH /api/v1/wanted/:id/close — poster only
router.patch('/:id/close', authenticate, closeWantedPost);

// DELETE /api/v1/wanted/:id — poster or moderator
router.delete('/:id', authenticate, deleteWantedPost);

export default router;
