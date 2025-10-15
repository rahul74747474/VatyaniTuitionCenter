
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { google } from "googleapis";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// ----------- OAuth2 Setup -----------
const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

// ----------- Send Email Function -----------
async function sendEmail({ name, className, subject, contact, message }) {
  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "vatyanituitioncenter@gmail.com", // Gmail you authorized
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });

    const mailOptions = {
      from: "Contact Form <vatyanituitioncenter@gmail.com>",
      to: process.env.TARGET_EMAIL,
      subject: "New Contact / Enrollment Inquiry",
      text: `
        Name: ${name}
        Class: ${className}
        Subject: ${subject}
        Contact: ${contact}
        Message: ${message}
      `,
    };

    const result = await transport.sendMail(mailOptions);
    return result;
  } catch (err) {
    console.error("Gmail API Error:", err);
    throw err;
  }
}

// ----------- API Route -----------
app.post("/api/contact", async (req, res) => {
  try {
    await sendEmail(req.body);
    res.json({ success: true, message: "Email sent successfully!" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to send email" });
  }
});

// ----------- Start Server -----------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
