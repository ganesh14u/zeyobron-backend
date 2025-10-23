import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { sendPasswordResetEmail, sendWelcomeEmail } from '../services/emailService.js';

const router = express.Router();

router.post('/signup', async (req, res) => {
  const { name, email, phone, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: 'Email exists' });
  const hashed = await bcrypt.hash(password, 10);
  
  // New users get "Big Data Free" category by default
  const user = await User.create({ 
    name, 
    email, 
    phone, 
    password: hashed,
    subscribedCategories: ['Big Data Free'],
    subscription: 'free'
  });
  
  // Send welcome email
  try {
    await sendWelcomeEmail(email, name);
  } catch (emailError) {
    console.error('Welcome email failed:', emailError);
    // Don't fail signup if email fails
  }
  
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.json({ 
    token, 
    user: { 
      id: user._id, 
      name: user.name, 
      email: user.email,
      phone: user.phone,
      role: user.role,
      subscription: user.subscription,
      subscribedCategories: user.subscribedCategories,
      isActive: user.isActive
    } 
  });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });
  
  if (!user.isActive) {
    return res.status(403).json({ message: 'Account deactivated. Contact admin.' });
  }
  
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ 
    token, 
    user: { 
      id: user._id, 
      name: user.name, 
      email: user.email,
      phone: user.phone,
      role: user.role,
      subscription: user.subscription,
      subscribedCategories: user.subscribedCategories,
      isActive: user.isActive
    } 
  });
});

// Forgot Password - Generate reset token
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'No account with that email exists' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send email with reset link
    try {
      await sendPasswordResetEmail(user.email, resetToken, user.name);
      res.json({ 
        message: 'Password reset link sent to your email',
        // Don't send the actual URL in production for security
      });
    } catch (emailError) {
      // If email fails, still return success to prevent email enumeration
      console.error('Email sending failed:', emailError.message);
      console.error('Email config check:', {
        hasEmailUser: !!process.env.EMAIL_USER,
        hasEmailPass: !!process.env.EMAIL_PASS,
        emailUser: process.env.EMAIL_USER
      });
      res.json({ 
        message: 'Password reset link sent to your email'
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reset Password
router.post('/reset-password/:token', async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Set new password
    user.password = await bcrypt.hash(req.body.password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current user data (protected route)
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -resetPasswordToken -resetPasswordExpires');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update profile (protected route)
router.put('/update-profile', protect, async (req, res) => {
  try {
    const { name, phone } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone || '';  // Allow empty string

    await user.save();

    const updatedUser = user.toObject();
    delete updatedUser.password;
    delete updatedUser.resetPasswordToken;
    delete updatedUser.resetPasswordExpires;

    res.json({ 
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
