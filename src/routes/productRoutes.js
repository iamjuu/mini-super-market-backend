import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import {
  getVariantsByProduct,
  createVariant,
} from '../controllers/variantController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', optionalAuth, createProduct);
router.patch('/:id', optionalAuth, updateProduct);
router.put('/:id', optionalAuth, updateProduct);
router.delete('/:id', optionalAuth, deleteProduct);

// Product variant sub-routes
router.get('/:productId/variants', getVariantsByProduct);
router.post('/:productId/variants', optionalAuth, createVariant);

export default router;
