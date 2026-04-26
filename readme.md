♻️ Plastic RRR (Recycle, Reduce, Reuse) System

A full-stack USSD + Web Admin Dashboard + API backend system for managing plastic waste collection, user rewards, and recycling points. Built with Node.js, Express, MongoDB, JWT authentication, and Africa’s Talking SMS API.

🚀 Project Overview

Plastic RRR is a digital waste management system that allows users to:

Register via USSD
Submit plastic waste (in kg)
Earn reward points
Track submissions
Get SMS feedback after approval/rejection

Admins can:

Log in securely using JWT
Approve or reject submissions
View pending requests
Track statistics and history
Send automatic SMS updates to users
🏗️ System Architecture
Mobile User (USSD)
        ↓
   Express Backend (Node.js)
        ↓
   MongoDB Database
        ↓
Admin Dashboard (Web UI)
        ↓
Africa’s Talking SMS API
⚙️ Tech Stack
Backend
Node.js
Express.js
MongoDB (Mongoose)
JWT (Authentication)
bcrypt.js (Password hashing)
express-rate-limit (Security)
dotenv (Environment variables)
External Services
Africa’s Talking SMS API
USSD Gateway Integration
Frontend (Admin UI)
HTML
CSS
Vanilla JavaScript
📦 Installation
1. Clone repository
git clone https://github.com/your-username/plastic-rrr.git
cd plastic-rrr
2. Install dependencies
npm install
3. Create .env file in root directory
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key

ADMIN_USER=admin
ADMIN_PASS=hashed_password_here

AT_API_KEY=your_africas_talking_api_key
AT_USERNAME=your_username
🔐 Generating Secure Values
Generate JWT Secret

Run in terminal:

node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
Generate Admin Password (hashed)

Run:

node -e "console.log(require('bcryptjs').hashSync('yourPassword', 10))"

Copy result into:

ADMIN_PASS=...
▶️ Running the Project
Start server
node index.js

Or using nodemon:

npx nodemon index.js

Server runs on:

http://localhost:3000
📱 USSD Flow
Main Menu
1. Register
2. Login
Registration Flow
Enter Name → Address → Collection Point → Profile Code Generated
Login Flow
Enter Profile Code →
1. Submit Plastic
2. View Points
Submit Plastic
Enter weight (kg) → Stored as pending transaction
🧑‍💼 Admin Features
Authentication
JWT-based login system
Secure middleware protection
Endpoints
Method	Endpoint	Description
POST	/admin/login	Admin login
GET	/admin/pending	View pending submissions
POST	/admin/approve/:id	Approve transaction
POST	/admin/reject/:id	Reject transaction
GET	/admin/history	View history
GET	/admin/stats	View analytics
📊 Admin Dashboard Features
View pending submissions
Approve / Reject waste submissions
Real-time refresh
View total statistics:
Total submissions
Approved
Rejected
Total kilograms collected
📩 SMS Notifications

Automatically sends SMS using Africa’s Talking:

When Approved:
User receives points
Total points updated
When Rejected:
User notified of rejection
🔒 Security Features
JWT authentication for admin routes
Password hashing with bcrypt
Rate limiting (100 requests / 15 min)
Protected admin APIs
Input validation on USSD flow
🗄️ Database Models
User Model
name
phone
address
profileCode
points
totalPoints
collectionPoint
Transaction Model
phone
profileCode
userWeight
status (pending/approved/rejected)
timestamps
🧠 Key Features Summary

✔ USSD registration system
✔ Plastic submission tracking
✔ Reward points system
✔ Admin dashboard
✔ SMS notifications
✔ Secure authentication
✔ REST API backend
✔ MongoDB database

🚀 Future Improvements
Payment integration for rewards
Mobile app version
QR code-based collection
Advanced analytics dashboard
Multi-admin roles
👨‍💻 Developer

Muhammad Thakeeb Muhammad
Computer Engineer | Full-Stack Developer | IoT Enthusiast

📜 License

This project is for educational and environmental sustainability purposes.