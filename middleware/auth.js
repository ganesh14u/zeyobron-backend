import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Not authorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    
    // Check if user account is active
    if (!req.user.isActive) {
      return res.status(403).json({ message: 'Account deactivated. Contact admin.' });
    }
    
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalid' });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  next();
};
