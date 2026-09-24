/**
 * wantedController.ts — Phase 10A: Wanted Board
 */
import { Request, Response, NextFunction } from 'express';
import { WantedPost } from '../models/WantedPost';
import { AppError } from '../utils/appError';
import { sendSuccess, sendPaginated } from '../utils/apiResponse';

/** POST /api/v1/wanted */
export async function createWantedPost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { title, description, category, budgetMin, budgetMax, preferredConditions } = req.body as Record<string, unknown>;

    if (!title || !category) {
      return next(new AppError('Title and category are required', 400));
    }

    const post = await WantedPost.create({
      poster: req.user!._id,
      college: req.user!.college,
      title,
      description,
      category,
      budgetMin,
      budgetMax,
      preferredConditions: preferredConditions ?? [],
    });

    sendSuccess(res, { post }, 'Wanted post created', 201);
  } catch (err) {
    next(err);
  }
}

/** GET /api/v1/wanted — campus-scoped, paginated */
export async function getWantedPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const college = (req.query.college as string) || req.user?.college;
    const category = req.query.category as string | undefined;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {
      status: 'OPEN',
      ...(college ? { college } : {}),
      ...(category ? { category } : {}),
    };

    const [posts, total] = await Promise.all([
      WantedPost.find(filter)
        .populate('poster', 'fullName avatar college branch graduationYear trustScore')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      WantedPost.countDocuments(filter),
    ]);

    sendPaginated(res, posts, total, page, limit);
  } catch (err) {
    next(err);
  }
}

/** GET /api/v1/wanted/:id */
export async function getWantedPostById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const post = await WantedPost.findById(req.params.id)
      .populate('poster', 'fullName avatar college branch graduationYear trustScore');
    if (!post) return next(new AppError('Wanted post not found', 404));
    sendSuccess(res, { post });
  } catch (err) {
    next(err);
  }
}

/** PATCH /api/v1/wanted/:id/close */
export async function closeWantedPost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const post = await WantedPost.findById(req.params.id);
    if (!post) return next(new AppError('Wanted post not found', 404));

    const posterId = String(post.poster);
    if (posterId !== String(req.user!._id)) {
      return next(new AppError('You can only close your own wanted posts', 403));
    }

    post.status = 'CLOSED';
    await post.save();
    sendSuccess(res, { post }, 'Wanted post closed');
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/v1/wanted/:id */
export async function deleteWantedPost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const post = await WantedPost.findById(req.params.id);
    if (!post) return next(new AppError('Wanted post not found', 404));

    const posterId = String(post.poster);
    const isModerator = ['MODERATOR', 'SUPER_ADMIN'].includes(req.user!.role);
    if (posterId !== String(req.user!._id) && !isModerator) {
      return next(new AppError('Not authorized to delete this post', 403));
    }

    await post.deleteOne();
    sendSuccess(res, null, 'Wanted post deleted');
  } catch (err) {
    next(err);
  }
}
