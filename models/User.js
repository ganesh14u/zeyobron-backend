import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,
  password: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  subscription: {
    type: String,
    enum: ['free', 'premium'],
    default: 'free'
  },
  subscribedCategories: [{ type: String }],
  isActive: { type: Boolean, default: true },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  createdAt: { type: Date, default: Date.now }
});

// Method to check if user has premium (lifetime, no expiry)
userSchema.methods.hasPremiumSubscription = function() {
  return this.subscription === 'premium';
};

// Method to check if user has access to category
userSchema.methods.hasAccessToCategory = function(category) {
  // Premium users only get access to their subscribed categories
  return this.subscribedCategories.includes(category);
};

export default mongoose.model('User', userSchema);
