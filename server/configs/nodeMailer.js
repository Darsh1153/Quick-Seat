import nodemailer from "nodemailer";

// Determine which email service to use based on environment variables
const isGmail = process.env.EMAIL_USER && process.env.EMAIL_USER.includes('@gmail.com');

// Create a transporter using either Gmail or Brevo SMTP
const transporter = nodemailer.createTransport({
  host: isGmail ? "smtp.gmail.com" : "smtp-relay.brevo.com",
  port: isGmail ? 465 : 587,
  secure: isGmail ? true : false, // true for Gmail (465), false for Brevo (587)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter configuration on startup
transporter.verify(function (error, success) {
  if (error) {
    console.error('[NodeMailer] SMTP configuration error:', error);
    console.error('[NodeMailer] Please check your EMAIL_USER and EMAIL_PASS environment variables');
  } else {
    console.log('[NodeMailer] SMTP server is ready to send emails');
  }
});

const sendEmail = async ({ to, subject, body }) => {
    try {
        console.log('[NodeMailer] Attempting to send email to:', to);
        console.log('[NodeMailer] Subject:', subject);
        console.log('[NodeMailer] From:', process.env.SENDER_EMAIL);
        
        if (!process.env.SENDER_EMAIL) {
            throw new Error('SENDER_EMAIL environment variable is not set');
        }
        
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            throw new Error('EMAIL_USER or EMAIL_PASS environment variables are not set');
        }
        
        const response = await transporter.sendMail({
            from: process.env.SENDER_EMAIL,
            to,
            subject,
            html: body,
        });
        
        console.log('[NodeMailer] Email sent successfully:', {
            messageId: response.messageId,
            accepted: response.accepted,
            rejected: response.rejected
        });
        
        return response;
    } catch (error) {
        console.error('[NodeMailer] Failed to send email:', {
            error: error.message,
            code: error.code,
            command: error.command,
            to,
            subject
        });
        throw error;
    }
}

export default sendEmail;