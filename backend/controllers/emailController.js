const nodemailer = require('nodemailer');
const OTP = require('../models/OTP');

const emailController = {
  // Configure nodemailer transporter - FIXED: createTransport instead of createTransporter
  // transporter: nodemailer.createTransport({
  //   host: 'smtp.ethereal.email',
  //   port: 587,
  //   auth: {
  //     user: process.env.EMAIL_USER,
  //     pass: process.env.EMAIL_PASS
  //   }
  // }),

  transporter: nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure:true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  }),



  // Generate random OTP
  generateOTP: () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },

  // Send OTP email
  sendOTP: async (email, otp, type = 'password_reset') => {
    try {
      const subject = type === 'password_reset' 
        ? 'Password Reset OTP - Food Ordering System'
        : 'Email Verification - Food Ordering System';

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ef4444;">Food Ordering System</h2>
          <div style="background: #f8fafc; padding: 20px; border-radius: 10px;">
            <h3>${type === 'password_reset' ? 'Password Reset' : 'Email Verification'}</h3>
            <p>Your verification code is:</p>
            <div style="font-size: 32px; font-weight: bold; color: #ef4444; letter-spacing: 8px; text-align: center; margin: 20px 0;">
              ${otp}
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p style="color: #6b7280; font-size: 12px;">
              If you didn't request this, please ignore this email.
            </p>
          </div>
        </div>
      `;

      await emailController.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject,
        html
      });

      console.log(`OTP sent to ${email}: ${otp}`);
      return true;
    } catch (error) {
      console.error('Email sending error:', error);
      throw new Error('Failed to send email');
    }
  },

  // Store OTP in database
  storeOTP: async (email, otp, type) => {
    try {
      // Invalidate any existing OTPs for this email and type
      await OTP.updateMany(
        { email, type, used: false },
        { used: true }
      );

      // Create new OTP
      const otpDoc = new OTP({
        email,
        otp,
        type,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      });

      await otpDoc.save();
      return otpDoc;
    } catch (error) {
      console.error('Store OTP error:', error);
      throw new Error('Failed to store OTP');
    }
  },

  // Verify OTP
  
  verifyOTP: async (email, otp, type) => {
    try {
      const otpDoc = await OTP.findOne({
        email,
        otp,
        type,
        used: false,
        expiresAt: { $gt: new Date() }
      });

      if (!otpDoc) {
        throw new Error('Invalid or expired OTP');
      }

      // DON'T mark as used here - we'll mark it as used only after password reset
      // otpDoc.used = true;
      // await otpDoc.save();

      return true;
    } catch (error) {
      console.error('Verify OTP error:', error);
      throw new Error('OTP verification failed');
    }
  },

  // Clean up expired OTPs (optional utility function)
  cleanupExpiredOTPs: async () => {
    try {
      const result = await OTP.deleteMany({
        expiresAt: { $lt: new Date() }
      });
      console.log(`Cleaned up ${result.deletedCount} expired OTPs`);
      return result;
    } catch (error) {
      console.error('Cleanup OTPs error:', error);
    }
  }
};

module.exports = emailController;