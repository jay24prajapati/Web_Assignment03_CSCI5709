import nodemailer from 'nodemailer';

export const sendVerificationEmail = async (to: string, token: string) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Verify Your Email - DineBook',
    html: `
      <h2>Welcome to DineBook!</h2>
      <p>Please verify your email by clicking the link below:</p>
      <a href="http://localhost:4200/verify?token=${token}" style="padding: 10px 20px; background-color: #d32f2f; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
      <p>If you didn’t sign up, please ignore this email.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};