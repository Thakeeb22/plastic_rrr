require("dotenv").config();

const express = require("express");

const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const Africastalking = require("africastalking");
const rateLimit = require("express-rate-limit");

const User = require("./models/User");
const Transaction = require("./models/Transaction");

const africastalking = Africastalking({
  apiKey: process.env.AT_API_KEY,
  username: process.env.AT_USERNAME,
});
const sms = africastalking.SMS;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(limiter);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Plastic RRR server running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// UTIL FUNCTIONS
function generateProfileCode(name) {
  const prefix = name.substring(0, 3).padEnd(3, "X").toUpperCase();
  const random = Math.floor(100 + Math.random() * 900);
  return prefix + random;
}

function formatPhone(phone) {
  if (phone.startsWith("0")) return "+234" + phone.substring(1);
  if (phone.startsWith("234")) return "+" + phone;
  return phone;
}

async function sendSMS(to, message) {
  try {
    await sms.send({ to: [to], message });
    console.log("SMS sent");
  } catch (error) {
    console.log("SMS error:", error);
  }
}
// AUTH MIDDLEWARE
function auth(req, res, next) {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ success: false, message: "No token" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({ success: false });
    }

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
}
// USSD ROUTE
app.post("/ussd", async (req, res) => {
  const { phoneNumber, text } = req.body;

  let response = "";
  const data = (text || "").trim().split("*");

  if (text === "") {
    response = `CON Welcome to Plastic RRR
1. Register
2. Login`;
  } else if (text === "1") {
    response = `CON Enter your name`;
  } else if (data[0] === "1" && data.length === 2) {
    response = `CON Enter your address`;
  } else if (data[0] === "1" && data.length === 3) {
    response = `CON Select collection point:
1. Lugbe 1
2. Lugbe 2
3. Lugbe 3
4. Lugbe 4
5. Lugbe 5`;
  } else if (data[0] === "1" && data.length === 4) {
    const [_, name, address, point] = data;

    const existingUser = await User.findOne({ phone: phoneNumber });

    if (existingUser) {
      response = `END You are already registered`;
    } else {
      const profileCode = generateProfileCode(name);

      await User.create({
        phone: phoneNumber,
        name,
        address,
        profileCode,
        collectionPoint: point,
      });

      response = `END Registration successful
Profile Code: ${profileCode}`;
    }
  } else if (text === "2") {
    response = `CON Enter your profile code`;
  } else if (data[0] === "2" && data.length === 2) {
    const user = await User.findOne({
      profileCode: data[1],
      phone: phoneNumber,
    });

    if (!user) {
      response = `END Invalid profile code`;
    } else {
      response = `CON Welcome ${user.name}
1. Submit Plastic
2. View Points`;
    }
  } else if (data[0] === "2" && data[2] === "1" && data.length === 3) {
    response = `CON Enter Plastic quantity (kg)`;
  } else if (data[0] === "2" && data[2] === "1" && data.length === 4) {
    const weight = Number(data[3]);

    if (isNaN(weight) || weight <= 0) {
      response = `END Invalid quantity`;
    } else {
      const user = await User.findOne({
        profileCode: data[1],
        phone: phoneNumber,
      });

      if (!user) {
        response = `END User not found`;
      } else {
        const existing = await Transaction.findOne({
          phone: user.phone,
          status: "pending",
        });

        if (existing) {
          response = `END You already have a pending submission`;
          return res.send(response);
        }

        await Transaction.create({
          phone: user.phone,
          profileCode: user.profileCode,
          userWeight: weight,
          status: "pending",
        });

        response = `END Submission received`;
      }
    }
  } else if (data[0] === "2" && data[2] === "2") {
    const user = await User.findOne({
      profileCode: data[1],
      phone: phoneNumber,
    });

    response = user ? `END Points: ${user.points}` : `END User not found`;
  } else {
    response = `END Invalid option`;
  }

  res.set("Content-Type", "text/plain");
  res.send(response);
});

// ADMIN ROUTES
// Approve
app.post("/admin/approve/:id", auth, async (req, res) => {
  let transaction;

  try {
    transaction = await Transaction.findById(req.params.id);
  } catch {
    return res.status(500).json({ success: false });
  }

  if (!transaction || transaction.status !== "pending") {
    return res.json({ success: false });
  }

  transaction.status = "approved";
  await transaction.save();

  const user = await User.findOne({ phone: transaction.phone });

  if (!user) {
    return res.json({ success: false, message: "User not found" });
  }
  const points = transaction.userWeight * 100;
  user.points += points;
  user.totalPoints += points;
  await user.save();

  await sendSMS(
    formatPhone(user.phone),
    `Approved: ${transaction.userWeight}kg → ${points} points`,
  );

  res.json({ success: true });
});

// Reject
app.post("/admin/reject/:id", auth, async (req, res) => {
  const transaction = await Transaction.findById(req.params.id);

  if (!transaction || transaction.status !== "pending") {
    return res.json({ success: false });
  }

  transaction.status = "rejected";
  await transaction.save();

  await sendSMS(
    formatPhone(transaction.phone),
    `Rejected: ${transaction.userWeight}kg`,
  );

  res.json({ success: true });
});

// Pending
app.get("/admin/pending", auth, async (req, res) => {
  const data = await Transaction.find({ status: "pending" });
  res.json(data);
});

// History
app.get("/admin/history", auth, async (req, res) => {
  const data = await Transaction.find({
    status: { $in: ["approved", "rejected"] },
  }).sort({ createdAt: -1 });

  res.json(data);
});

// Stats
app.get("/admin/stats", auth, async (req, res) => {
  const total = await Transaction.countDocuments();
  const approved = await Transaction.countDocuments({ status: "approved" });
  const rejected = await Transaction.countDocuments({ status: "rejected" });

  const totalKg = await Transaction.aggregate([
    { $match: { status: "approved" } },
    { $group: { _id: null, total: { $sum: "$userWeight" } } },
  ]);

  res.json({
    total,
    approved,
    rejected,
    totalKg: totalKg[0]?.total || 0,
  });
});

// Admin Login
app.post("/admin/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.json({ success: false, message: "Missing fields" });
  }

  if (
    username !== process.env.ADMIN_USER ||
    password !== process.env.ADMIN_PASS
  ) {
    return res.json({ success: false, message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { username, role: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({ success: true, token });
});