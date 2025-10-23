import mongoose from 'mongoose';
import User from './models/User.js';
import Category from './models/Category.js';
import dotenv from 'dotenv';

dotenv.config();

const updateAdminCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    // Get all categories from database
    const allCategories = await Category.find();
    console.log('Categories in database:', allCategories.map(c => c.name));
    console.log('Total categories:', allCategories.length);

    // Update admin user to have ALL categories
    const admin = await User.findOne({ email: 'admin@netflix.com' });
    
    if (!admin) {
      console.log('Admin user not found');
      process.exit(1);
    }

    console.log('\nBefore update:');
    console.log('Admin subscribedCategories:', admin.subscribedCategories);
    console.log('Count:', admin.subscribedCategories?.length);

    // Set admin categories to match database categories
    admin.subscribedCategories = allCategories.map(c => c.name);
    admin.subscription = 'premium';
    admin.isActive = true;
    await admin.save();

    console.log('\nAfter update:');
    console.log('Admin subscribedCategories:', admin.subscribedCategories);
    console.log('Count:', admin.subscribedCategories.length);
    console.log('\n✅ Admin categories updated successfully!');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

updateAdminCategories();
