import nodemailer from 'nodemailer';

// Configure your SMTP transport here
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email provider
  auth: {
    user: process.env.EMAIL_USER, // your email address
    pass: process.env.EMAIL_PASS, // your email password or app password
  },
});

/**
 * Send an email
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} text - Plain text body
 * @param {string} html - HTML body (optional)
 * @param {Array} attachments - Attachments (optional)
 */
export async function sendMail({ to, subject, text, html, attachments }) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    html,
    attachments,
  };
  return transporter.sendMail(mailOptions);
} 