import express from 'express';
import authRoutes from './authRoutes.js';
import unitRoutes from './unitRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import subcategoryRoutes from './subcategoryRoutes.js';
import brandRoutes from './brandRoutes.js';
import productRoutes from './productRoutes.js';
import variantRoutes from './variantRoutes.js';
import shopRoutes from './shopRoutes.js';
import offerRoutes from './offerRoutes.js';
import cartRoutes from './cartRoutes.js';
import orderRoutes from './orderRoutes.js';
import customerRoutes from './customerRoutes.js';
import activityLogRoutes from './activityLogRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import platformRoutes from './platformRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import userRoutes from './userRoutes.js';
import uploadRoutes from './uploadRoutes.js';

const router = express.Router();

// 1. Auth routes
router.use('/auth', authRoutes);

// 2. Catalog & Taxonomy routes (Dual mounted for both /public and /admin paths)
router.use('/units', unitRoutes);
router.use('/admin/units', unitRoutes);

router.use('/categories', categoryRoutes);
router.use('/admin/categories', categoryRoutes);

router.use('/subcategories', subcategoryRoutes);
router.use('/admin/subcategories', subcategoryRoutes);

router.use('/brands', brandRoutes);
router.use('/admin/brands', brandRoutes);

router.use('/products', productRoutes);
router.use('/admin/products', productRoutes);

router.use('/variants', variantRoutes);

// 3. Shop & merchant routes
router.use('/shops', shopRoutes);
router.use('/admin/shops', shopRoutes);

// 4. Offers & carousel deals
router.use('/offers', offerRoutes);
router.use('/admin/offers', offerRoutes);

// 5. Orders & dispatch telemetry
router.use('/orders', orderRoutes);
router.use('/admin/orders', orderRoutes);

// 6. Customers directory
router.use('/customers', customerRoutes);
router.use('/admin/customers', customerRoutes);
router.use('/master-admin/customers', customerRoutes);

// 7. Activity Audit Logs
router.use('/activity-logs', activityLogRoutes);
router.use('/admin/activity-logs', activityLogRoutes);
router.use('/master-admin/activity-logs', activityLogRoutes);

// 8. Notifications & broadcasts
router.use('/notifications', notificationRoutes);
router.use('/admin/notifications', notificationRoutes);
router.use('/master-admin/notifications', notificationRoutes);

// 9. Dashboard telemetry
router.use('/admin/dashboard', dashboardRoutes);
router.use('/dashboard', dashboardRoutes);

// 10. Platform Settings, Appearance & Features
router.use('/public', platformRoutes);
router.use('/admin', platformRoutes);
router.use('/master-admin', platformRoutes);

// 11. User specific endpoints (/api/user/profile, /api/user/addresses, /api/user/cart, /api/user/orders)
router.use('/user', userRoutes);
router.use('/user/cart', cartRoutes);

// 12. Cloudinary Media Upload endpoints
router.use('/upload', uploadRoutes);
router.use('/admin/upload', uploadRoutes);

export default router;
