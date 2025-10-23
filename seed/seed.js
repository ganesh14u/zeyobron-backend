import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Movie from '../models/Movie.js';
import Category from '../models/Category.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Movie.deleteMany({});
    await Category.deleteMany({});

    // Create categories
    const categories = await Category.insertMany([
      { name: 'Action', description: 'Action-packed movies', isPremium: false },
      { name: 'Drama', description: 'Dramatic content', isPremium: false },
      { name: 'Thriller', description: 'Suspense and thrillers', isPremium: true },
      { name: 'Sci-Fi', description: 'Science Fiction', isPremium: true },
      { name: 'Crime', description: 'Crime and mystery', isPremium: true },
      { name: 'History', description: 'Historical content', isPremium: false },
      { name: 'Mystery', description: 'Mystery and detective', isPremium: true }
    ]);

    // Create admin user with premium subscription (lifetime)
    const adminPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      name: 'Admin User',
      email: 'admin@netflix.com',
      password: adminPassword,
      role: 'admin',
      subscription: 'premium',
      subscribedCategories: ['Action', 'Drama', 'Thriller', 'Sci-Fi', 'Crime', 'History', 'Mystery'],
      isActive: true
    });

    // Create premium user (lifetime)
    const premiumPassword = await bcrypt.hash('premium123', 10);
    await User.create({
      name: 'Premium User',
      email: 'premium@netflix.com',
      password: premiumPassword,
      role: 'user',
      subscription: 'premium',
      subscribedCategories: ['Thriller', 'Sci-Fi', 'Crime'],
      isActive: true
    });

    // Create regular free user
    const userPassword = await bcrypt.hash('user123', 10);
    await User.create({
      name: 'John Doe',
      email: 'user@netflix.com',
      password: userPassword,
      role: 'user',
      subscription: 'free',
      subscribedCategories: ['Action', 'Drama'],
      isActive: true
    });

    // Create sample movies with new structure
    const movies = [
      {
        title: 'Stranger Things',
        description: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments.',
        poster: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        category: ['Thriller', 'Drama', 'Sci-Fi'],
        batchNo: 'BATCH-2024-001',
        duration: '51min',
        featured: true,
        isPremium: true
      },
      {
        title: 'The Crown',
        description: 'Follows the political rivalries and romance of Queen Elizabeth II\'s reign.',
        poster: 'https://image.tmdb.org/t/p/w500/1M876KPjulVwppEpldhdc8V4o68.jpg',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        category: ['Drama', 'History'],
        batchNo: 'BATCH-2024-002',
        duration: '58min',
        featured: true,
        isPremium: false
      },
      {
        title: 'Breaking Bad',
        description: 'A high school chemistry teacher turned methamphetamine manufacturer.',
        poster: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        category: ['Crime', 'Drama', 'Thriller'],
        batchNo: 'BATCH-2024-003',
        duration: '47min',
        featured: false,
        isPremium: true
      },
      {
        title: 'Money Heist',
        description: 'A criminal mastermind manipulates the police as his team executes a perfect heist.',
        poster: 'https://image.tmdb.org/t/p/w500/reEMJA1uzscCbkpeRJeTT2bjqUp.jpg',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        category: ['Crime', 'Action', 'Thriller'],
        batchNo: 'BATCH-2024-004',
        duration: '70min',
        featured: true,
        isPremium: true
      },
      {
        title: 'Dark',
        description: 'A family saga with a supernatural twist across three generations.',
        poster: 'https://image.tmdb.org/t/p/w500/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        category: ['Mystery', 'Sci-Fi', 'Thriller'],
        batchNo: 'BATCH-2024-005',
        duration: '60min',
        featured: false,
        isPremium: true
      },
      {
        title: 'Free Action Movie',
        description: 'An action-packed free movie for all users.',
        poster: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        category: ['Action'],
        batchNo: 'BATCH-2024-006',
        duration: '45min',
        featured: true,
        isPremium: false
      }
    ];

    await Movie.insertMany(movies);

    console.log('Seed data created successfully!');
    console.log('\n=== Categories Created ===');
    console.log(categories.map(c => `${c.name} (${c.isPremium ? 'Premium' : 'Free'})`).join(', '));
    console.log('\n=== Login Credentials ===');
    console.log('Admin: admin@netflix.com / admin123 (Premium - Lifetime, All Categories)');
    console.log('Premium User: premium@netflix.com / premium123 (Lifetime, Thriller/Sci-Fi/Crime)');
    console.log('Free User: user@netflix.com / user123 (Action, Drama only)');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
