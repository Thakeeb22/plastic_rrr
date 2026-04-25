const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Transaction = require("./models/Transaction");
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const Africastalking = require("africastalking");
const africastalking = Africastalking({
  apiKey: process.env.AT_API_KEY,
  username: process.env.AT_USERNAME,
});
const sms = africastalking.SMS;
const app = express();
app.use(
  cors({
    origin: "*",
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
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
function generateProfileCode(name) {
  const prefix = name.substring(0, 3).padEnd(3, "X").toUpperCase();
  const random = Math.floor(100 + Math.random() * 900);
  return prefix + random;
}
app.post("/ussd", async (req, res) => {
  const { phoneNumber, text } = req.body;

  let response = "";
  const data = (text || "").trim().split("*");

  // Main menu
  if (text === "") {
    response = `CON Welcome to Plastic RRR
        1. Register
        2. Login`;
  }
  // register
  else if (text === "1") {
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
    const name = data[1];
    const address = data[2];
    const point = data[3];
    // prevent duplicate user
    let existingUser = await User.findOne({ phone: phoneNumber });
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
     Name: ${name}
     Your Profile Code: ${profileCode}
     You will use this profile code during login`;
    }
  }
  //   Login
  else if (text === "2") {
    response = `CON Enter your profile code`;
  } else if (data[0] === "2" && data.length === 2) {
    const code = data[1];
    const user = await User.findOne({
      profileCode: code,
      phone: phoneNumber,
    });
    if (!user) {
      response = `END Invalid profile code`;
    } else {
      response = `CON Welcome ${user.name}
        1. Submit Plastic
        2. View Points`;
    }
  }
  //   Submitting of plastic
  else if (data[0] === "2" && data.length === 3 && data[2] === "1") {
    response = `CON Enter Plastic quantity (kg)`;
  } else if (data[0] === "2" && data.length === 4 && data[2] === "1") {
    const code = data[1];
    const weight = Number(data[3]);
    if (isNaN(weight) || weight <= 0) {
      response = `END Invalid quantity`;
    } else {
      const user = await User.findOne({
        profileCode: code,
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
          res.set("Content-Type", "text/plain");
          return res.send(response);
        }
        await Transaction.create({
          phone: user.phone,
          profileCode: user.profileCode,
          userWeight: weight,
          status: "pending",
        });
        response = `END Submission received. Awaiting verification`;
      }
    }
  }
  // viewing of points
  else if (data[0] === "2" && data[2] === "2") {
    const user = await User.findOne({
      profileCode: data[1],
      phone: phoneNumber,
    });
    if (!user) {
      response = `END User not found`;
    } else {
      response = `END Points: ${user.points}`;
    }
  }
  //   dafault
  else {
    response = `END Invalid option`;
  }
  res.set("Content-Type", "text/plain");
  res.send(response);
});
// admin flow
//  admin approve route
app.post("/admin/approve", auth, async (req, res) => {
  const { transactionId } = req.body;
  const transaction = await Transaction.findById(transactionId);
  if (!transaction || transaction.status !== "pending") {
    return res.send("Already processed or not found");
  }
  transaction.status = "approved";
  await transaction.save();
  const user = await User.findOne({ phone: transaction.phone });
  const points = transaction.userWeight * 100;
  user.points += points;
  user.totalPoints += points;
  await user.save();
  try {
    await sendSMS(
      formatPhone(user.phone),
      `You have successfully deposited ${transaction.userWeight} kg of plastic.
    You have earned ${points} points. Your total points are now ${user.totalPoints}.
    Thank you for helping reduce plastic waste in the planet`,
    );
  } catch (e) {
    console.log("SMS failed but continuing with approval process", e);
  }
  res.redirect(`/admin?password=${req.body.password}`);
});
// admin reject route
app.post("/admin/reject", auth, async (req, res) => {
  const { transactionId } = req.body;
  const transaction = await Transaction.findById(transactionId);
  if (!transaction || transaction.status !== "pending") {
    return res.send("Already processed or not found");
  }
  transaction.status = "rejected";
  await transaction.save();
  try {
    await sendSMS(
      formatPhone(transaction.phone),
      `Your plastic submission of ${transaction.userWeight} kg was rejected.
    Please ensure you enter the correct weight next time.
    Thank you for helping reduce plastic waste in the planet`,
    );
  } catch (e) {
    console.log("SMS failed but continuing with approval process", e);
  }
  res.redirect(`/admin?password=${req.body.password}`);
});
// pending submissions
app.get("/admin/pending", auth, async (req, res) => {
  const transactions = await Transaction.find({ status: "pending" });
  res.json(transactions);
});
app.get("/admin", auth, async (req, res) => {
  const transactions = await Transaction.find({ status: "pending" });
  let html = `<h1>Pending Submissions</h1>
  <a href="/admin/history?password=${req.query.password}">View History</a>`;
  transactions.forEach((t) => {
    html += `
        <div style="border:1px solid #ccc; padding:10px; margin:10px">
        <p><b>Profile Code:</b> ${t.profileCode}</p>
        <p><b>Phone:</b> ${t.phone}</p>
        <p><b>Submitted:</b> ${t.userWeight} kg</p>
        <p><b>Time: </b> ${new Date(t.createdAt).toLocaleString()}</p>

        <form method="POST" action="/admin/approve?password=${req.query.password}" style="display:inline;">
        <input type="hidden" name="transactionId" value="${t._id}"/>
        <input type="hidden" name="password" value="${req.query.password}"/>
        <button type="submit">Approve</button>
        </form>

        <form method="POST" action="/admin/reject?password=${req.query.password}" style="display:inline;">
        <input type="hidden" name="transactionId" value="${t._id}"/>
        <input type="hidden" name="password" value="${req.query.password}"/>
        <button type="submit">Reject</button>
        </form>
        </div>`;
  });
  res.send(html);
});
// SMS function
async function sendSMS(to, message) {
  try {
    const response = await sms.send({
      to: [to],
      message,
    });
    console.log("SMS sent successfully:", response);
  } catch (error) {
    console.log("SMS error:", error);
  }
}
// format phone number
function formatPhone(phone) {
  if (phone.startsWith("0")) {
    return "+234" + phone.substring(1);
  }
  if (phone.startsWith("234")) {
    return "+" + phone;
  }
  return phone;
}
app.get("/admin/history", auth, async (req, res) => {
  const transactions = await Transaction.find({
    status: { $in: ["approved", "rejected"] },
  }).sort({ createdAt: -1 });
  let html = `<h1>Transaction History</h1>
  <a href="/admin?password=${req.query.password}">Back to Pending</a>`;
  transactions.forEach((t) => {
    html += `
    <div style="border:1px solid #ccc; padding:10px; margin:10px">
    <p><b>Profile Code:</b> ${t.profileCode}</p>
    <p><b>Phone:</b> ${t.phone}</p>
    <p><b>Weight:</b> ${t.userWeight} kg</p>
    <p><b>Status:</b> ${t.status}</p>
    <p><b>Time:</b> ${new Date(t.createdAt).toLocaleString()}</p>
    </div>
    `;
  });
  res.send(html);
});
app.post("/admin/login", async (req, res) => {
  const { username, password } = req.body;
  const ADMIN_USER = process.env.ADMIN_USER;
  const ADMIN_PASS = process.env.ADMIN_PASS;
  if (username !== ADMIN_USER) {
    return res.json({ success: false });
  }
  const isMatch = await bcrypt.compare(password, ADMIN_PASS);
  if (!isMatch) {
    return res.json({ success: false });
  }
  const token = jwt.sign({ username }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  res.json({ success: true, token });
});
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ success: false, message: "No token" });
  }
  const token = header.split(" ")[1];
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
}
