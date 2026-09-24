import { Router } from 'express';
import healthRoutes from './healthRoutes';

const apiRouter = Router();

// Mount Health Check endpoint: /api/v1/health
apiRouter.use('/health', healthRoutes);

// Additional routes will be mounted here in subsequent phases:
// apiRouter.use('/auth', authRoutes);
// apiRouter.use('/users', userRoutes);
// apiRouter.use('/listings', listingRoutes);
// apiRouter.use('/colleges', collegeRoutes);

export default apiRouter;
