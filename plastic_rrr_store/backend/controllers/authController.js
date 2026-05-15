const User = require("../models/User")
const jwt = require("jsonwebtoken");
const loginUser = async (req, res) => {
  try {
    let {profileCode, phone } = req.body
    // normalize phone no.
    if(phone.startWith("0")){
      phone = "+234" + phone.slice(1)
    }
    const user = await User.findOne({
      profileCode,
      phone,
    })
    if(!user){
      return res.status(400).json({
        message: "Invalid Credentials"
      })
    }
    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn:"7d",
      }
    )
    res.json({
      token,
      user
    })
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
module.exports = { loginUser };
