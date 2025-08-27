const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // from your .env
    pass: process.env.EMAIL_PASS, // from your .env
  },
});

module.exports.sendOTP = async (email, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Wanderlust Email Verification",
    text: `Your OTP for email verification is: ${otp}\n\nThis OTP will expire in 5 minutes.`,
  });
};
