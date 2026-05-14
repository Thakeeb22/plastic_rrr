const Product = require("../models/Product");
// get products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
// create product
const createProduct = async (req, res) => {
  try {
    const { name, points, stock, image } = req.body;
    if (!name || !points || !image) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }
    const product = await Product.create({
      name,
      points,
      stock,
      image,
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
module.exports = { getProducts, createProducts };
