const mongoose = require("mongoose");
const transactionSchema = new mongoose.Schema({
  phone: String,
  profileCode: String,
  userWeight: Number,
  status: {
    type: String,
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
module.exports = mongoose.model("Transaction", transactionSchema);
