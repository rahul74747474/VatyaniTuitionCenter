import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// 📩 POST route to handle form submission
app.post("/api/contact", async (req, res) => {
  const { name, className, subject, contact, message } = req.body;

  // 🧠 Configure your email transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // your gmail address
      pass: process.env.EMAIL_PASS, // app password (not your normal password)
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.TARGET_EMAIL, // where you want to receive messages
    subject: "New Contact / Enrollment Inquiry",
    text: `
      Name: ${name}
      Class: ${className}
      Subject: ${subject}
      Contact: ${contact}
      Message: ${message}
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Email sent successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to send email" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));