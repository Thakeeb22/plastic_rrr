const User = require("./models/User");
const Transaction = require("./models/Transaction");
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
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
  const data = text.split("*");

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
    response = `CON ENter your profile code`;
  } else if (data[0] === "2" && data.length === 2) {
    const code = data[1];
    const user = await User.findOne({ profileCode: code });
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
  } else if (data[0] === "2" && data.length === 4 && data[2] === "1" ) {
    const code = data[1];
    const weight = Number(data[3]);
    if (isNaN(weight) || weight <= 0) {
      response = `END Invalid quantity`;
    } else {
      const user = await User.findOne({ profileCode: code });
      if (!user) {
        response = `END User not found`;
      } else {
        await Transaction.create({
          phone: user.phone,
          userWeight: weight,
        });
        response = `END Submission recieved. Awaiting verification`;
      }
    }
  }
  // viewing of points
  else if (data[0] === "2" && data[2] === "2") {
    const code = data[1];
    const user = await User.findOne({ profileCode: code });
    if(!user){
        response = `END User not found`
    }else{
        response = `END Points: ${user.points}`
    }
  }
//   dafault
else{
    response = `END Invalid option`
}
res.set("Content-Type", "text/plain")
res.send(response)
});
