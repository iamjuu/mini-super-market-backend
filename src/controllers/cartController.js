import Cart from '../models/Cart.js';

export const getCart = async (req, res, next) => {
  try {
    const userId = req.user._id;
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = await Cart.create({
        userId,
        items: [],
        subtotal: 0,
        deliveryFee: 0,
        discount: 0,
        totalAmount: 0,
      });
    } else {
      cart.recalculate();
      await cart.save();
    }

    return res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (err) {
    next(err);
  }
};

export const addItem = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const {
      productId,
      name,
      price,
      originalPrice,
      image,
      quantity = 1,
      unit,
      category,
      categoryId,
      deliveryPrice,
    } = req.body;

    if (!productId || !name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Product details and price are required.',
      });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const itemQuantity = Number(quantity) || 1;
    const existingIndex = cart.items.findIndex(
      (item) => String(item.productId) === String(productId) || item.name === name
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += itemQuantity;
      if (price !== undefined) cart.items[existingIndex].price = Number(price);
      if (deliveryPrice !== undefined) cart.items[existingIndex].deliveryPrice = Number(deliveryPrice);
    } else {
      cart.items.push({
        productId: String(productId),
        name: name.trim(),
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : Number(price) * 1.25,
        image: image || '',
        quantity: itemQuantity,
        unit: unit || 'piece',
        category: category || 'General',
        categoryId: categoryId || null,
        deliveryPrice: deliveryPrice !== undefined ? Number(deliveryPrice) : 30,
      });
    }

    cart.recalculate();
    await cart.save();

    return res.status(200).json({
      success: true,
      message: 'Item added to cart',
      data: cart,
    });
  } catch (err) {
    next(err);
  }
};

export const updateItemQuantity = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params; // itemId or productId
    const { quantity } = req.body;

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    const newQty = Number(quantity);
    if (newQty <= 0) {
      cart.items = cart.items.filter(
        (it) => String(it._id) !== String(id) && String(it.productId) !== String(id)
      );
    } else {
      const item = cart.items.find(
        (it) => String(it._id) !== String(id) && String(it.productId) === String(id)
          ? true
          : String(it._id) === String(id)
      );
      if (item) {
        item.quantity = newQty;
      }
    }

    cart.recalculate();
    await cart.save();

    return res.status(200).json({
      success: true,
      message: 'Cart item updated',
      data: cart,
    });
  } catch (err) {
    next(err);
  }
};

export const removeItem = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    cart.items = cart.items.filter(
      (it) => String(it._id) !== String(id) && String(it.productId) !== String(id)
    );

    cart.recalculate();
    await cart.save();

    return res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: cart,
    });
  } catch (err) {
    next(err);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    const userId = req.user._id;
    let cart = await Cart.findOne({ userId });
    if (cart) {
      cart.items = [];
      cart.subtotal = 0;
      cart.deliveryFee = 0;
      cart.discount = 0;
      cart.totalAmount = 0;
      await cart.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      data: cart,
    });
  } catch (err) {
    next(err);
  }
};

export default { getCart, addItem, updateItemQuantity, removeItem, clearCart };
