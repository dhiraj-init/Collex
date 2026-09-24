/**
 * bundleController.ts — Phase 10B: Graduation Mode & Campus Bundles
 */
import { Request, Response, NextFunction } from 'express';
import { Bundle } from '../models/Bundle';
import { Listing } from '../models/Listing';
import { AppError } from '../utils/appError';
import { sendSuccess, sendPaginated } from '../utils/apiResponse';

/** POST /api/v1/bundles */
export async function createBundle(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { title, description, listings, bundlePrice, bundleType, isGraduationSale, graduationYear, discountPercentage } = req.body as Record<string, unknown>;

    if (!title || !description || !listings || !Array.isArray(listings) || listings.length === 0 || bundlePrice === undefined) {
      return next(new AppError('Title, description, listings array, and bundlePrice are required', 400));
    }

    // Verify all listings belong to the user and are active
    const userListings = await Listing.find({ _id: { $in: listings }, seller: req.user!._id, status: 'ACTIVE' });
    if (userListings.length !== listings.length) {
      return next(new AppError('Some listings are invalid, not active, or do not belong to you', 400));
    }

    const totalOriginalPrice = userListings.reduce((sum, item) => sum + item.price, 0);

    const bundle = await Bundle.create({
      title,
      description,
      seller: req.user!._id,
      college: req.user!.college,
      listings,
      bundlePrice,
      totalOriginalPrice,
      discountPercentage: discountPercentage ?? (totalOriginalPrice > 0 ? Math.round(((totalOriginalPrice - Number(bundlePrice)) / totalOriginalPrice) * 100) : 0),
      bundleType: bundleType ?? 'GRADUATION_SALE',
      isGraduationSale: isGraduationSale ?? true,
      graduationYear: graduationYear ?? req.user!.graduationYear,
    });

    // Update listings to reference this bundle
    await Listing.updateMany(
      { _id: { $in: listings } },
      { $set: { bundleId: bundle._id, isGraduationSale: isGraduationSale ?? true } }
    );

    sendSuccess(res, { bundle }, 'Bundle created successfully', 201);
  } catch (err) {
    next(err);
  }
}

/** GET /api/v1/bundles */
export async function getBundles(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const college = (req.query.college as string) || req.user?.college;
    const bundleType = req.query.bundleType as string | undefined;
    const isGraduationSale = req.query.isGraduationSale === 'true';
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {
      status: 'ACTIVE',
      ...(college ? { college } : {}),
      ...(bundleType ? { bundleType } : {}),
      ...(req.query.isGraduationSale !== undefined ? { isGraduationSale } : {}),
    };

    const [bundles, total] = await Promise.all([
      Bundle.find(filter)
        .populate('seller', 'fullName avatar college branch graduationYear trustScore')
        .populate('listings', 'title images price category itemCondition')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Bundle.countDocuments(filter),
    ]);

    sendPaginated(res, bundles, total, page, limit);
  } catch (err) {
    next(err);
  }
}

/** GET /api/v1/bundles/:id */
export async function getBundleById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const bundle = await Bundle.findById(req.params.id)
      .populate('seller', 'fullName avatar college branch graduationYear trustScore')
      .populate('listings');

    if (!bundle) return next(new AppError('Bundle not found', 404));

    // Increment views
    bundle.viewsCount += 1;
    await bundle.save({ timestamps: false });

    sendSuccess(res, { bundle });
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/v1/bundles/:id */
export async function deleteBundle(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const bundle = await Bundle.findById(req.params.id);
    if (!bundle) return next(new AppError('Bundle not found', 404));

    if (String(bundle.seller) !== String(req.user!._id) && !['MODERATOR', 'SUPER_ADMIN'].includes(req.user!.role)) {
      return next(new AppError('Not authorized to delete this bundle', 403));
    }

    // Remove bundle reference from listings
    await Listing.updateMany(
      { bundleId: bundle._id },
      { $unset: { bundleId: 1, isGraduationSale: 1 } }
    );

    await bundle.deleteOne();
    sendSuccess(res, null, 'Bundle deleted');
  } catch (err) {
    next(err);
  }
}
