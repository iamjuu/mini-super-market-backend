import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

/**
 * Handle single image upload
 * Accepts:
 *   - req.body.image (base64 string or remote URL)
 *   - req.body.file (base64 string or remote URL)
 *   - req.body.folder (optional, defaults to 'shamil_marketplace')
 */
export const uploadSingleImage = async (req, res) => {
  try {
    const fileData = req.body.image || req.body.file || req.body.url;
    const folder = req.body.folder || 'shamil_marketplace';

    if (!fileData) {
      return res.status(400).json({
        success: false,
        message: 'No image provided. Please send a base64 image data URL or remote image URL in "image" field.',
      });
    }

    const uploadResult = await uploadToCloudinary(fileData, folder);

    return res.status(200).json({
      success: true,
      message: 'Image uploaded successfully to Cloudinary',
      data: uploadResult,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Image upload failed',
    });
  }
};

/**
 * Handle multiple images upload
 * Accepts:
 *   - req.body.images (array of base64 strings or URLs)
 *   - req.body.folder (optional)
 */
export const uploadMultipleImages = async (req, res) => {
  try {
    const files = req.body.images || req.body.files;
    const folder = req.body.folder || 'shamil_marketplace';

    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please send an array of image data URLs in "images" field.',
      });
    }

    const uploadPromises = files.map((file) => uploadToCloudinary(file, folder));
    const results = await Promise.all(uploadPromises);

    return res.status(200).json({
      success: true,
      message: `${results.length} images uploaded successfully to Cloudinary`,
      data: results,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Multiple images upload failed',
    });
  }
};

/**
 * Delete image by public ID
 */
export const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.params;
    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Public ID is required to delete an image.',
      });
    }

    const result = await deleteFromCloudinary(publicId);

    return res.status(200).json({
      success: true,
      message: 'Image deleted from Cloudinary',
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete image',
    });
  }
};

export default {
  uploadSingleImage,
  uploadMultipleImages,
  deleteImage,
};
