const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");

// ✅ Explicitly load .env from root/backend
dotenv.config({ path: __dirname + '/../.env' });

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const email = "admin@mobistore.com";
    const plainPassword = "admin123";

    const existing = await Admin.findOne({ email });
    if (!existing) {
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      await Admin.create({ email, password: hashedPassword });
      console.log("✅ Admin created");
    } else {
      console.log("ℹ️ Admin already exists");
    }

    process.exit();
  })
  .catch((err) => {
    console.error("❌ DB Connection failed:", err);
    process.exit(1);
  });
