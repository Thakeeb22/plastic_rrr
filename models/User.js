const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  name: String,
  address: String,
  profileCode: {
    type: String,
    unique: true,
  },
  collectionPoint: String,
  points: {
    type: Number,
    default: 0,
  },
  totalPoints: {
    type: Number,
    default: 0,
  },
});
module.exports = mongoose.model("User", userSchema);
