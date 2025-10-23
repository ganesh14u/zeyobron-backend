import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send password reset email
export const sendPasswordResetEmail = async (email, resetToken, userName) => {
  try {
    const transporter = createTransporter();
    
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: `"Zeyobron Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request - Zeyobron',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #000; color: #fff;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #000;">
                <tr>
                    <td align="center" style="padding: 40px 20px;">
                        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #111; border-radius: 8px; overflow: hidden; border: 1px solid #333;">
                            <!-- Header -->
                            <tr>
                                <td style="padding: 30px 40px; text-align: center; background: linear-gradient(90deg, #e50914, #f40612);">
                                    <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: white;">ZEYOBRON</h1>
                                </td>
                            </tr>
                            
                            <!-- Content -->
                            <tr>
                                <td style="padding: 40px;">
                                    <h2 style="margin: 0 0 20px 0; color: white; font-size: 24px;">Password Reset Request</h2>
                                    
                                    <p style="margin: 0 0 20px 0; color: #ccc; font-size: 16px; line-height: 1.5;">
                                        Hello ${userName || 'User'},
                                    </p>
                                    
                                    <p style="margin: 0 0 20px 0; color: #ccc; font-size: 16px; line-height: 1.5;">
                                        We received a request to reset your password for your Zeyobron account. 
                                        Click the button below to create a new password.
                                    </p>
                                    
                                    <table width="100%" cellpadding="0" cellspacing="0">
                                        <tr>
                                            <td align="center" style="padding: 30px 0;">
                                                <a href="${resetUrl}" 
                                                   style="display: inline-block; padding: 15px 30px; background: #e50914; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px;">
                                                    Reset Password
                                                </a>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <p style="margin: 0 0 20px 0; color: #999; font-size: 14px; line-height: 1.5;">
                                        If you didn't request this, please ignore this email. Your password will remain unchanged.
                                    </p>
                                    
                                    <p style="margin: 0 0 20px 0; color: #999; font-size: 14px; line-height: 1.5;">
                                        This link will expire in 1 hour for security reasons.
                                    </p>
                                    
                                    <p style="margin: 0 0 10px 0; color: #999; font-size: 14px;">
                                        Having trouble clicking the button? Copy and paste this link into your browser:
                                    </p>
                                    <p style="margin: 0; color: #e50914; font-size: 12px; word-break: break-all;">
                                        ${resetUrl}
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="padding: 30px 40px; background-color: #1a1a1a; text-align: center; border-top: 1px solid #333;">
                                    <p style="margin: 0 0 10px 0; color: #999; font-size: 12px;">
                                        © 2025 Zeyobron. All rights reserved.
                                    </p>
                                    <p style="margin: 0; color: #999; font-size: 12px;">
                                        This email was sent to ${email} because a password reset was requested.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully to:', email);
    return result;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

// Send welcome email
export const sendWelcomeEmail = async (email, userName) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Zeyobron Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to Zeyobron!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to Zeyobron</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #000; color: #fff;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #000;">
                <tr>
                    <td align="center" style="padding: 40px 20px;">
                        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #111; border-radius: 8px; overflow: hidden; border: 1px solid #333;">
                            <!-- Header -->
                            <tr>
                                <td style="padding: 30px 40px; text-align: center; background: linear-gradient(90deg, #e50914, #f40612);">
                                    <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: white;">ZEYOBRON</h1>
                                </td>
                            </tr>
                            
                            <!-- Content -->
                            <tr>
                                <td style="padding: 40px;">
                                    <h2 style="margin: 0 0 20px 0; color: white; font-size: 24px;">Welcome to Zeyobron!</h2>
                                    
                                    <p style="margin: 0 0 20px 0; color: #ccc; font-size: 16px; line-height: 1.5;">
                                        Hi ${userName || 'there'},
                                    </p>
                                    
                                    <p style="margin: 0 0 20px 0; color: #ccc; font-size: 16px; line-height: 1.5;">
                                        Welcome to Zeyobron! We're excited to have you join our streaming community.
                                    </p>
                                    
                                    <p style="margin: 0 0 20px 0; color: #ccc; font-size: 16px; line-height: 1.5;">
                                        Start exploring our vast collection of videos in the "Big Data Free" category and discover premium content.
                                    </p>
                                    
                                    <table width="100%" cellpadding="0" cellspacing="0">
                                        <tr>
                                            <td align="center" style="padding: 30px 0;">
                                                <a href="${process.env.CLIENT_URL}" 
                                                   style="display: inline-block; padding: 15px 30px; background: #e50914; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px;">
                                                    Start Watching
                                                </a>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <p style="margin: 0 0 20px 0; color: #999; font-size: 14px; line-height: 1.5;">
                                        If you have any questions, feel free to contact our support team.
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="padding: 30px 40px; background-color: #1a1a1a; text-align: center; border-top: 1px solid #333;">
                                    <p style="margin: 0 0 10px 0; color: #999; font-size: 12px;">
                                        © 2025 Zeyobron. All rights reserved.
                                    </p>
                                    <p style="margin: 0; color: #999; font-size: 12px;">
                                        This email was sent to ${email} as part of your account registration.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully to:', email);
    return result;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw new Error('Failed to send welcome email');
  }
};

export default {
  sendPasswordResetEmail,
  sendWelcomeEmail
};