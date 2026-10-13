import Customer from '../models/Customer.js';
import Order from '../models/Order.js';

export const getCustomers = async (req, res, next) => {
  try {
    const { filter = 'all', search, page = 1, limit = 7 } = req.query;
    const query = {};

    if (filter && filter !== 'all') {
      query.status = filter.toUpperCase();
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const pageSize = parseInt(limit, 10) || 7;
    const currentPage = parseInt(page, 10) || 1;
    const skip = (currentPage - 1) * pageSize;

    const [customers, total] = await Promise.all([
      Customer.find(query).sort({ createdAt: -1 }).skip(skip).limit(pageSize),
      Customer.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        customers,
        pagination: {
          total,
          page: currentPage,
          pages: Math.ceil(total / pageSize) || 1,
          limit: pageSize,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getCustomerById = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    const orders = await Order.find({ customerEmail: customer.email }).sort({ placedAt: -1 }).limit(10);

    return res.status(200).json({
      success: true,
      data: {
        customer,
        orders,
      },
    });
  } catch (err) {
    next(err);
  }
};

export default { getCustomers, getCustomerById };
