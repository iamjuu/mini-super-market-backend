import Category from '../models/Category.js';
import Subcategory from '../models/Subcategory.js';
import Brand from '../models/Brand.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Customer from '../models/Customer.js';
import Shop from '../models/Shop.js';
import Offer from '../models/Offer.js';

export const getDashboardMetrics = async (req, res, next) => {
  try {
    const [
      totalCategories,
      totalSubcategories,
      totalBrands,
      totalProducts,
      totalOrders,
      totalCustomers,
      totalShops,
      totalOffers,
      recentOrders,
    ] = await Promise.all([
      Category.countDocuments(),
      Subcategory.countDocuments(),
      Brand.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Customer.countDocuments(),
      Shop.countDocuments(),
      Offer.countDocuments(),
      Order.find().sort({ placedAt: -1 }).limit(5),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalCategories,
        totalSubcategories,
        totalBrands,
        totalProducts,
        totalOrders,
        totalCustomers,
        totalShops,
        totalOffers,
        recentOrders,
      },
    });
  } catch (err) {
    next(err);
  }
};

export default { getDashboardMetrics };
