import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary if credentials exist in environment
const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

/**
 * Upload an image (base64 string or remote URL) to Cloudinary
 * Falls back safely to data URI or direct URL if Cloudinary credentials are not configured in dev
 */
export async function uploadImage(
  imageSource: string,
  folder = 'collex/listings'
): Promise<string> {
  if (!imageSource) {
    throw new Error('No image provided for upload');
  }

  // If Cloudinary is configured, upload to Cloudinary CDN
  if (isCloudinaryConfigured) {
    const uploadResult = await cloudinary.uploader.upload(imageSource, {
      folder,
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 900, crop: 'limit' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' },
      ],
    });
    return uploadResult.secure_url;
  }

  // Fallback for development environments:
  // If it's already a URL or base64 data URI, return it directly
  return imageSource;
}

export { isCloudinaryConfigured };
