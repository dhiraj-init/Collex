import { Router } from 'express';
import healthRoutes from './healthRoutes';
import authRoutes from './authRoutes';
import listingRoutes from './listingRoutes';
import chatRoutes from './chatRoutes';
import transactionRoutes from './transactionRoutes';
import reviewRoutes from './reviewRoutes';
import trustRoutes from './trustRoutes';
import mlRoutes from './mlRoutes';

const apiRouter = Router();

// 1. Health Check: /api/v1/health
apiRouter.use('/health', healthRoutes);

// 2. Authentication: /api/v1/auth
apiRouter.use('/auth', authRoutes);

// 3. Marketplace Listings: /api/v1/listings
apiRouter.use('/listings', listingRoutes);

// 4. Real-time Chat & Offers: /api/v1/chat
apiRouter.use('/chat', chatRoutes);

// 5. Transactions & Campus Meetups: /api/v1/transactions
apiRouter.use('/transactions', transactionRoutes);

// 6. Mutual Reviews: /api/v1/reviews
apiRouter.use('/reviews', reviewRoutes);

// 7. Trust & Safety: /api/v1/trust
apiRouter.use('/trust', trustRoutes);

// 8 & 9. ML Service Proxy (Price Intelligence + Collex Shield): /api/v1/ml
apiRouter.use('/ml', mlRoutes);

export default apiRouter;
