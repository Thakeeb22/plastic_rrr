const jwt = require("jsonwebtoken");
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    // check admin credentials
    if (
      username !== process.env.ADMIN_USER ||
      password !== process.env.ADMIN_PASS
    ) {
      return res.status(401).json({
        message: "Invalid Credentials",
      });
    }
    // create token
    const token = jwt.sign(
      {
        username,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );
    res.json({
      token,
      user: {
        username,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
module.exports = { loginUser };
