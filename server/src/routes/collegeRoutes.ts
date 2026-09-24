import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/authMiddleware';
import {
  listColleges,
  getCollegeBySlug,
  createCollege,
  updateCollege,
  getCollegeDashboard,
  getCollegeMeetupSpots,
} from '../controllers/collegeController';

const router = Router();

// Public
router.get('/', listColleges);
router.get('/:slug', getCollegeBySlug);
router.get('/:slug/meetup-spots', getCollegeMeetupSpots);

// College Admin or Super Admin
router.get('/:slug/dashboard', authenticate, authorize('COLLEGE_ADMIN', 'SUPER_ADMIN', 'MODERATOR'), getCollegeDashboard);
router.patch('/:slug', authenticate, authorize('COLLEGE_ADMIN', 'SUPER_ADMIN'), updateCollege);

// Super Admin only
router.post('/', authenticate, authorize('SUPER_ADMIN'), createCollege);

export default router;
