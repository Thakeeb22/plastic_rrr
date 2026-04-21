const User = require("./models/User");
const Transaction = require("./models/Transaction");
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const Africastalking = require("africastalking");
const africastalking = Africastalking({
  apiKey: process.env.AT_API_KEY,
  username: process.env.AT_USERNAME,
});
const sms = africastalking.SMS;
const app = express();
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
  const prefix = name.substring(0, 3).toUpperCase();
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
app.post("/admin/approve", async (req, res) => {
  const { transactionId } = req.body;
  const transaction = await Transaction.findById(transactionId);
  if (!transaction) return res.send("Transaction not found");
  if (transaction.status !== "pending") {
    return res.send("Already processed");
  }
  transaction.status = "approved";
  await transaction.save();
  const user = await User.findOne({ phone: transaction.phone });
  const points = transaction.userWeight * 100;
  user.points += points;
  user.totalPoints += points;
  await user.save();
  await sendSMS(
    user.phone,
    `You have successfully deposited ${transaction.userWeight} kg of plastic.
    You have earned ${points} points. Your total points are now ${user.totalPoints}.
    Thank you for helping reduce plastic waste in the planet`,
  );
  res.redirect("/admin");
});
// admin reject route
app.post("/admin/reject", async (req, res) => {
  const { transactionId } = req.body;
  const transaction = await Transaction.findById(transactionId);
  if (!transaction) return res.send("Transaction not found");
  if (transaction.status !== "pending") {
    return res.send("Already processed");
  }
  transaction.status = "rejected";
  await transaction.save();
  await sendSMS(
    transaction.phone,
    `Your plastic submission of ${transaction.userWeight} kg has been rejected. 
    Please ensure you enter the correct weight nex time.
    Thank you for helping reduce plastic waste in the planet`,
  );
  res.redirect("/admin");
});
// pending submissions
app.get("/admin/pending", async (req, res) => {
  const transactions = await Transaction.find({ status: "pending" });
  res.json(transactions);
});
app.get("/admin", async (req, res) => {
  const transactions = await Transaction.find({ status: "pending" });
  let html = `<h1>Pending Submissions</h1>`;
  transactions.forEach((t) => {
    html += `
        <div style="border:1px solid #ccc; padding:10px; margin:10px">
        <p><b>Profile Code:</b> ${t.profileCode}</p>
        <p><b>Phone:</b> ${t.phone}</p>
        <p><b>Submitted:</b> ${t.userWeight} kg</p>
        <p><b>Time: </b> ${new Date(t.createdAt).toLocaleString()}</p>

        <form method="POST" action="/admin/approve" style="display:inline;">
        <input type="hidden" name="transactionId" value="${t._id}"/>
        <button type="submit">Approve</button>
        </form>

        <form method="POST" action="/admin/reject" style="display:inline;">
        <input type="hidden" name="transactionId" value="${t._id}"/>
        <button type="submit">Reject</button>
        </form>
        </div>`;
  });
  res.send(html);
});
// SMS function
async function sendSMS(to, message) {
  try {
    const respnse = await sms.send({
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
  if (!phone.startsWith("+")) {
    return "+" + phone;
  }
  return phone;
}
await sendSMS(formatPhone(user.phone), message);
