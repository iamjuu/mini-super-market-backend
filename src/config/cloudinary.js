import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'fh7pfz1i',
  api_key: process.env.CLOUDINARY_API_KEY || '511323673583287',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'mpcnVQW_mW_9oioNWL4RkGe-RdA',
  secure: true,
});

/**
 * Upload an image (base64 data URL, remote HTTP URL, or local file path) to Cloudinary
 * @param {string} fileInput - Base64 string (data:image/...), remote URL, or local file path
 * @param {string} folder - Destination folder name in Cloudinary
 * @param {object} customOptions - Extra Cloudinary upload parameters
 * @returns {Promise<{ url: string, publicId: string, width: number, height: number, format: string, bytes: number }>}
 */
export const uploadToCloudinary = async (fileInput, folder = 'shamil_marketplace', customOptions = {}) => {
  if (!fileInput) {
    throw new Error('No image file or URL provided for upload');
  }

  // If already a Cloudinary URL, return as-is
  if (typeof fileInput === 'string' && fileInput.includes('res.cloudinary.com')) {
    return {
      url: fileInput,
      publicId: '',
    };
  }

  try {
    const uploadOptions = {
      folder,
      resource_type: 'auto',
      transformation: [
        { quality: 'auto', fetch_format: 'auto' }, // Automatically delivers best compression & format (WebP/AVIF)
      ],
      ...customOptions,
    };

    const result = await cloudinary.uploader.upload(fileInput, uploadOptions);

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    };
  } catch (error) {
    console.error('❌ [Cloudinary Upload Error]:', error.message);
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

/**
 * Delete an asset from Cloudinary by public ID
 * @param {string} publicId
 * @returns {Promise<object>}
 */
export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return null;
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('❌ [Cloudinary Delete Error]:', error.message);
    return null;
  }
};

/**
 * Helper to process any image input (auto-uploads base64 data URLs to Cloudinary)
 */
export const processSingleImage = async (imageInput, folder = 'shamil_marketplace') => {
  if (!imageInput || typeof imageInput !== 'string') return imageInput;
  if (imageInput.startsWith('data:image/')) {
    const res = await uploadToCloudinary(imageInput, folder);
    return res.url;
  }
  return imageInput;
};

/**
 * Helper to process arrays of image inputs
 */
export const processIncomingImages = async (imagesInput, folder = 'shamil_marketplace') => {
  if (!imagesInput) return [];
  const list = Array.isArray(imagesInput) ? imagesInput : [imagesInput];
  const processed = await Promise.all(
    list.map(async (img) => {
      if (typeof img === 'string' && img.startsWith('data:image/')) {
        const res = await uploadToCloudinary(img, folder);
        return res.url;
      }
      return img;
    })
  );
  return processed;
};

export default cloudinary;
