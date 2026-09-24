import { Router } from 'express';
import healthRoutes from './healthRoutes';
import authRoutes from './authRoutes';
import listingRoutes from './listingRoutes';

const apiRouter = Router();

// Mount Health Check endpoint: /api/v1/health
apiRouter.use('/health', healthRoutes);

// Mount Authentication endpoints: /api/v1/auth
apiRouter.use('/auth', authRoutes);

// Mount Marketplace Listing endpoints: /api/v1/listings
apiRouter.use('/listings', listingRoutes);

export default apiRouter;
