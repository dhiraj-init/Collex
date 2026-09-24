import { Router } from 'express';
import healthRoutes from './healthRoutes';
import authRoutes from './authRoutes';

const apiRouter = Router();

// Mount Health Check endpoint: /api/v1/health
apiRouter.use('/health', healthRoutes);

// Mount Authentication endpoints: /api/v1/auth
apiRouter.use('/auth', authRoutes);
// apiRouter.use('/users', userRoutes);
// apiRouter.use('/listings', listingRoutes);
// apiRouter.use('/colleges', collegeRoutes);

export default apiRouter;
