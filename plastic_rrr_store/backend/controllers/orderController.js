const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

const createOrder = async (req, res) => {
  try {
    const { userId, cart } = req.body;
    if (!cart || cart.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }
    let totalPoints = 0;
    // check products adn calculate total
    for (const item of cart) {
      const product = await Product.findById(item._id);
      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }
      totalPoints += product.points;
      // reduce stock
      product.stock -= 1;
      await product.save();
    }
    // find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    // check users points
    if (user.points < totalPoints) {
      return res.status(400).json({
        message: "Insufficient points",
      });
    }
    // deduct users point
    user.points -= totalPoints;
    await user.save();
    // create order
    const order = await Order.create({
      user: user._id,
      products: cart.map((item) => ({
        product: item.id,
        quantity: 1,
      })),
      totalPoints,
    });
    res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
// get all orders
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user")
      .populate("products.product");
    res.json(orders);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
module.exports = { createOrder, getOrders };
