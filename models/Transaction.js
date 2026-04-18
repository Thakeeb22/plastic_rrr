const mongoose = require("mongoose");
const transactionSchema = new mongoose.Schema({
  phone: String,
  userWeight: Number,
  verifiedWeight: {
    type: Number,
    default: 0,
  },
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
