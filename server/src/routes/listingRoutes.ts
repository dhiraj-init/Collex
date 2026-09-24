import { Router } from 'express';
import {
  getListings,
  getTrendingListings,
  getRecentlyListed,
  getListingById,
  createListing,
  updateListing,
  updateListingStatus,
  deleteListing,
  toggleSaveListing,
  getMyListings,
  getSavedListings,
  uploadListingImage,
} from '../controllers/listingController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

// Public / Discovery routes (Optionally personalized if token present)
router.get('/', getListings);
router.get('/trending', getTrendingListings);
router.get('/recent', getRecentlyListed);

// Authenticated personal collection routes (must be placed before /:id)
router.get('/me/items', authenticate, getMyListings);
router.get('/me/saved', authenticate, getSavedListings);
router.post('/upload', authenticate, uploadListingImage);

// Individual listing route
router.get('/:id', getListingById);

// Protected mutation routes
router.post('/', authenticate, createListing);
router.put('/:id', authenticate, updateListing);
router.patch('/:id/status', authenticate, updateListingStatus);
router.delete('/:id', authenticate, deleteListing);
router.post('/:id/save', authenticate, toggleSaveListing);

export default router;
