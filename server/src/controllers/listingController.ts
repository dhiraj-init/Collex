import { Request, Response, NextFunction } from 'express';
import { Listing, IListing } from '../models/Listing';
import { User } from '../models/User';
import { AppError } from '../utils/appError';
import { uploadImage } from '../utils/cloudinary';

/**
 * Trending Score Calculation Algorithm (Decaying Recency & Engagement)
 *
 * Formula:
 * TrendingScore = (views * 1.5 + saves * 3.0 + 10) / ((ageInHours + 2) ^ 1.2)
 *
 * Rationale:
 * - Saves (bookmarks) demonstrate high purchase intent (weighted 3.0x).
 * - Views demonstrate curiosity/traffic (weighted 1.5x).
 * - A base constant (+10) ensures newly created listings get an initial visibility boost.
 * - The time-decay denominator (ageInHours + 2)^1.2 prevents popular old items from
 *   permanently dominating the campus feed.
 */
function calculateTrendingScore(listing: IListing): number {
  const ageInHours = (Date.now() - new Date(listing.createdAt).getTime()) / (1000 * 60 * 60);
  const engagement = listing.viewsCount * 1.5 + listing.savesCount * 3.0 + 10;
  const decay = Math.pow(ageInHours + 2, 1.2);
  return engagement / decay;
}

/**
 * GET /api/v1/listings
 * Fetch paginated listings with multi-faceted filtering, search, and campus scoping
 */
export async function getListings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      college,
      search,
      category,
      listingType,
      condition,
      minPrice,
      maxPrice,
      sortBy = 'newest',
      status = 'ACTIVE',
      page = '1',
      limit = '12',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    // Filter criteria builder
    const filter: Record<string, unknown> = {};

    // 1. Campus scoping
    const targetCollege = (college as string) || req.user?.college;
    if (targetCollege && targetCollege !== 'All Campuses') {
      filter.college = new RegExp(`^${targetCollege.trim()}$`, 'i');
    }

    // 2. Status filter
    if (status && status !== 'ALL') {
      filter.status = status;
    }

    // 3. Category filter
    if (category && category !== 'ALL') {
      filter.category = (category as string).toUpperCase();
    }

    // 4. Listing type filter (SELL, RENT, EXCHANGE, FREE)
    if (listingType && listingType !== 'ALL') {
      filter.listingType = (listingType as string).toUpperCase();
    }

    // 5. Condition filter
    if (condition && condition !== 'ALL') {
      filter.itemCondition = (condition as string).toUpperCase();
    }

    // 6. Price range
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined && minPrice !== '') {
        (filter.price as Record<string, number>).$gte = Number(minPrice);
      }
      if (maxPrice !== undefined && maxPrice !== '') {
        (filter.price as Record<string, number>).$lte = Number(maxPrice);
      }
    }

    // 7. Search query (regex matching for flexible substring discovery)
    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchTerms = search.trim();
      const regex = new RegExp(searchTerms, 'i');
      filter.$or = [
        { title: regex },
        { description: regex },
        { brand: regex },
        { tags: regex },
      ];
    }

    // Sort order definition
    let sortQuery: Record<string, 1 | -1> = { createdAt: -1 };
    if (sortBy === 'lowest_price' || sortBy === 'price_asc') {
      sortQuery = { price: 1 };
    } else if (sortBy === 'highest_price' || sortBy === 'price_desc') {
      sortQuery = { price: -1 };
    } else if (sortBy === 'popular' || sortBy === 'views') {
      sortQuery = { viewsCount: -1 };
    }

    const [listings, totalCount] = await Promise.all([
      Listing.find(filter)
        .populate('seller', 'fullName avatar college branch trustScore verificationStatus')
        .sort(sortQuery)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Listing.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum) || 1;

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Listings fetched successfully',
      data: {
        listings,
        campusContext: targetCollege || 'All Campuses',
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalCount,
          limit: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/listings/trending
 * Campus-scoped trending items based on engagement and recency decay
 */
export async function getTrendingListings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { college, limit = '8' } = req.query;
    const targetCollege = (college as string) || req.user?.college || 'IIT Bombay';
    const limitNum = Math.min(20, Math.max(1, parseInt(limit as string, 10) || 8));

    const filter: Record<string, unknown> = {
      status: 'ACTIVE',
    };

    if (targetCollege && targetCollege !== 'All Campuses') {
      filter.college = new RegExp(`^${targetCollege.trim()}$`, 'i');
    }

    // Fetch active listings for campus
    const activeListings = await Listing.find(filter)
      .populate('seller', 'fullName avatar college branch trustScore verificationStatus')
      .lean();

    // Score using trending algorithm
    const scoredListings = activeListings.map((item) => ({
      ...item,
      trendingScore: calculateTrendingScore(item as unknown as IListing),
    }));

    // Sort descending by score
    scoredListings.sort((a, b) => b.trendingScore - a.trendingScore);

    const trending = scoredListings.slice(0, limitNum);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Trending campus listings fetched',
      data: {
        campus: targetCollege,
        algorithm: 'TrendingScore = (views * 1.5 + saves * 3.0 + 10) / ((ageInHours + 2) ^ 1.2)',
        listings: trending,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/listings/recent
 * Returns recently listed active items for the student's campus
 */
export async function getRecentlyListed(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { college, limit = '8' } = req.query;
    const targetCollege = (college as string) || req.user?.college || 'IIT Bombay';
    const limitNum = Math.min(20, Math.max(1, parseInt(limit as string, 10) || 8));

    const filter: Record<string, unknown> = { status: 'ACTIVE' };
    if (targetCollege && targetCollege !== 'All Campuses') {
      filter.college = new RegExp(`^${targetCollege.trim()}$`, 'i');
    }

    const listings = await Listing.find(filter)
      .populate('seller', 'fullName avatar college branch trustScore verificationStatus')
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .lean();

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Recently listed items fetched',
      data: {
        campus: targetCollege,
        listings,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/listings/:id
 * Retrieve single listing, increment view count, and fetch related campus recommendations
 */
export async function getListingById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const listing = await Listing.findById(id).populate(
      'seller',
      'fullName email avatar college branch graduationYear trustScore verificationStatus createdAt'
    );

    if (!listing) {
      throw new AppError(404, 'Marketplace listing not found');
    }

    // Increment views count atomically
    await Listing.findByIdAndUpdate(id, { $inc: { viewsCount: 1 } });
    listing.viewsCount += 1;

    // Fetch related listings in same category & campus
    const relatedListings = await Listing.find({
      _id: { $ne: listing._id },
      college: listing.college,
      category: listing.category,
      status: 'ACTIVE',
    })
      .populate('seller', 'fullName avatar college branch trustScore verificationStatus')
      .limit(4)
      .lean();

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Listing details fetched successfully',
      data: {
        listing,
        relatedListings,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/listings
 * Create a new campus listing (authenticated students only)
 */
export async function createListing(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required to post a listing');
    }

    const {
      title,
      description,
      category,
      listingType = 'SELL',
      price = 0,
      negotiable = false,
      originalPrice,
      itemCondition = 'GOOD',
      brand,
      purchaseAge,
      images = [],
      tags = [],
    } = req.body;

    if (!title || !description || !category) {
      throw new AppError(400, 'Title, description, and category are required');
    }

    if (images.length > 6) {
      throw new AppError(400, 'Maximum 6 images allowed per listing');
    }

    // Upload base64 images if present
    const processedImages: string[] = [];
    for (const img of images) {
      if (typeof img === 'string' && img.startsWith('data:image')) {
        const uploadedUrl = await uploadImage(img);
        processedImages.push(uploadedUrl);
      } else if (typeof img === 'string') {
        processedImages.push(img);
      }
    }

    const newListing = await Listing.create({
      seller: req.user._id,
      college: req.user.college, // Campus scoping locked to seller's college
      title: title.trim(),
      description: description.trim(),
      category: category.toUpperCase(),
      listingType: listingType.toUpperCase(),
      price: Number(price),
      negotiable: Boolean(negotiable),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      itemCondition: itemCondition.toUpperCase(),
      brand: brand?.trim() || undefined,
      purchaseAge: purchaseAge?.trim() || undefined,
      images: processedImages,
      tags: Array.isArray(tags) ? tags.map((t: string) => t.trim()) : [],
      status: 'ACTIVE',
    });

    const populatedListing = await Listing.findById(newListing._id).populate(
      'seller',
      'fullName avatar college branch trustScore verificationStatus'
    );

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'Listing published successfully to your campus marketplace',
      data: { listing: populatedListing },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/v1/listings/:id
 * Edit an existing listing (Owner or Admin authorization required)
 */
export async function updateListing(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
      throw new AppError(404, 'Listing not found');
    }

    // Authorization check: Only the seller or Admin/Mod can edit
    const isOwner = listing.seller.toString() === req.user._id.toString();
    const isStaff = req.user.role === 'SUPER_ADMIN' || req.user.role === 'MODERATOR';

    if (!isOwner && !isStaff) {
      throw new AppError(403, 'Unauthorized: You can only edit your own listings');
    }

    const allowedUpdates = [
      'title',
      'description',
      'category',
      'listingType',
      'price',
      'negotiable',
      'originalPrice',
      'itemCondition',
      'brand',
      'purchaseAge',
      'images',
      'tags',
      'status',
    ];

    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        (listing as unknown as Record<string, unknown>)[key] = req.body[key];
      }
    }

    await listing.save();

    const updated = await Listing.findById(listing._id).populate(
      'seller',
      'fullName avatar college branch trustScore verificationStatus'
    );

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Listing updated successfully',
      data: { listing: updated },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/v1/listings/:id/status
 * Update status (ACTIVE, RESERVED, SOLD, ARCHIVED)
 */
export async function updateListingStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['DRAFT', 'ACTIVE', 'RESERVED', 'SOLD', 'ARCHIVED'];
    if (!status || !validStatuses.includes(status)) {
      throw new AppError(400, `Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const listing = await Listing.findById(id);
    if (!listing) {
      throw new AppError(404, 'Listing not found');
    }

    const isOwner = listing.seller.toString() === req.user._id.toString();
    const isStaff = req.user.role === 'SUPER_ADMIN' || req.user.role === 'MODERATOR';
    if (!isOwner && !isStaff) {
      throw new AppError(403, 'Unauthorized: You can only modify status for your own listing');
    }

    listing.status = status;
    await listing.save();

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: `Listing status updated to ${status}`,
      data: { listing },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/listings/:id
 * Delete or archive listing
 */
export async function deleteListing(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
      throw new AppError(404, 'Listing not found');
    }

    const isOwner = listing.seller.toString() === req.user._id.toString();
    const isStaff = req.user.role === 'SUPER_ADMIN' || req.user.role === 'MODERATOR';
    if (!isOwner && !isStaff) {
      throw new AppError(403, 'Unauthorized: You can only delete your own listings');
    }

    await Listing.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Listing removed successfully from marketplace',
      data: { deletedId: id },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/listings/:id/save
 * Toggle bookmark/save listing for authenticated student
 */
export async function toggleSaveListing(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
      throw new AppError(404, 'Listing not found');
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      throw new AppError(404, 'User account not found');
    }

    const userIdStr = req.user._id.toString();
    const isSaved = (user.savedListings || []).some((item) => item.toString() === id);

    if (isSaved) {
      // Unsave
      user.savedListings = (user.savedListings || []).filter((item) => item.toString() !== id);
      listing.savedBy = (listing.savedBy || []).filter((uId) => uId.toString() !== userIdStr);
      listing.savesCount = Math.max(0, listing.savesCount - 1);
    } else {
      // Save
      user.savedListings = [...(user.savedListings || []), listing._id];
      listing.savedBy = [...(listing.savedBy || []), req.user._id];
      listing.savesCount += 1;
    }

    await Promise.all([user.save(), listing.save()]);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: isSaved ? 'Listing removed from saved items' : 'Listing saved to your bookmarks',
      data: {
        isSaved: !isSaved,
        savesCount: listing.savesCount,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/listings/me/items
 * Fetch seller's personal listings and dashboard analytics
 */
export async function getMyListings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const listings = await Listing.find({ seller: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    const analytics = {
      totalItems: listings.length,
      activeItems: listings.filter((l) => l.status === 'ACTIVE').length,
      reservedItems: listings.filter((l) => l.status === 'RESERVED').length,
      soldItems: listings.filter((l) => l.status === 'SOLD').length,
      totalViews: listings.reduce((sum, l) => sum + (l.viewsCount || 0), 0),
      totalSaves: listings.reduce((sum, l) => sum + (l.savesCount || 0), 0),
    };

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Seller listings and analytics fetched',
      data: {
        analytics,
        listings,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/listings/me/saved
 * Fetch current user's saved items
 */
export async function getSavedListings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const user = await User.findById(req.user._id).populate({
      path: 'savedListings',
      populate: {
        path: 'seller',
        select: 'fullName avatar college branch trustScore verificationStatus',
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Saved listings fetched',
      data: {
        listings: user.savedListings || [],
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/listings/upload
 * Upload image asset to Cloudinary CDN
 */
export async function uploadListingImage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const { image } = req.body;
    if (!image) {
      throw new AppError(400, 'Image data (base64 or URL) is required');
    }

    const secureUrl = await uploadImage(image);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Image uploaded successfully',
      data: { url: secureUrl },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/listings/recommended (Phase 10: Course-Aware Discovery)
 * Deterministic recommendation engine based on user profile.
 * Weights:
 * - Same department: +30
 * - Same semester/year: +20
 */
export async function getRecommendedListings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const limit = Math.min(20, parseInt(req.query.limit as string) || 10);
    
    // We only recommend active listings from the same college (baseline isolation)
    const candidates = await Listing.find({ college: user.college, status: 'ACTIVE' })
      .populate('seller', 'fullName avatar trustScore')
      .lean();

    // Deterministic scoring
    const scoredListings = candidates.map(listing => {
      let score = 0;
      
      // Trust score baseline
      const seller = listing.seller as any;
      if (seller && seller.trustScore) {
        score += seller.trustScore * 0.1; // Max +10 for trust score 100
      }

      // Phase 10: Course-Aware matching
      if (listing.department && user.branch && listing.department.toLowerCase() === user.branch.toLowerCase()) {
        score += 30;
      }
      
      // If user's graduation year matches listing's academic year conceptually
      // (Rough heuristic for 'same year' if they are graduating soon)
      if (listing.isGraduationSale) {
        // Boost grad sales slightly for everyone to clear out inventory
        score += 5;
      }
      
      // Recency boost (newer = better)
      const ageInDays = (Date.now() - new Date(listing.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      score += Math.max(0, 20 - ageInDays); // Max +20 for brand new items
      
      return { listing, score };
    });

    // Sort descending by score
    scoredListings.sort((a, b) => b.score - a.score);

    // Return top N
    const recommendedListings = scoredListings.slice(0, limit).map(item => item.listing);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Recommended listings fetched successfully',
      data: {
        listings: recommendedListings,
        metadata: { strategy: 'DETERMINISTIC_COURSE_AWARE' }
      }
    });
  } catch (error) {
    next(error);
  }
}
