import express from 'express';
import { uploadSingleImage, uploadMultipleImages, deleteImage } from '../controllers/uploadController.js';

const router = express.Router();

// POST /api/upload - Single image upload
router.post('/', uploadSingleImage);

// POST /api/upload/multiple - Multiple images batch upload
router.post('/multiple', uploadMultipleImages);

// DELETE /api/upload/:publicId - Delete image from Cloudinary
router.delete('/:publicId', deleteImage);

export default router;
