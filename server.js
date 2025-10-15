import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { google } from "googleapis";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

async function sendEmail({ name, className, subject, contact, message }) {
  const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

  const emailLines = [
    `From: "Contact Form" <${process.env.SENDER_EMAIL}>`,
    `To: ${process.env.TARGET_EMAIL}`,
    `Subject: New Contact / Enrollment Inquiry`,
    "",
    `Name: ${name}`,
    `Class: ${className}`,
    `Subject: ${subject}`,
    `Contact: ${contact}`,
    `Message: ${message}`,
  ];

  const email = emailLines.join("\r\n");
  const encodedMessage = Buffer.from(email)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw: encodedMessage },
  });
}

app.post("/api/contact", async (req, res) => {
  try {
    await sendEmail(req.body);
    res.json({ success: true, message: "Email sent successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to send email" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
