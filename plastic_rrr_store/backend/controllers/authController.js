const User = require("../models/User");
const jwt = require("jsonwebtoken");

const loginUser = async (req, res) => {
  try {
    const { profileCode, phone } = req.body;
    const user = await User.findOne({
      profileCode,
      phone,
    });
    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }
    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );
    res.json({
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
module.exports = { loginUser };
