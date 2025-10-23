import express from 'express';
import Movie from '../models/Movie.js';
import Category from '../models/Category.js';
import User from '../models/User.js';
import { protect, adminOnly } from '../middleware/auth.js';
import multer from 'multer';
import { Readable } from 'stream';
import csv from 'csv-parser';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// ==================== MOVIE ROUTES ====================

// Download sample CSV template
router.get('/movies/sample-csv', protect, adminOnly, (req, res) => {
  const sampleCSV = `title,description,poster,videoUrl,videoType,category,batchNo,duration,featured,isPremium
Sample Movie 1,This is a great action movie,https://via.placeholder.com/300x450?text=Movie1,https://www.youtube.com/watch?v=dQw4w9WgXcQ,youtube,"Action,Drama",BATCH-2024-001,2h 15min,true,true
Sample Movie 2,Comedy film for everyone,https://via.placeholder.com/300x450?text=Movie2,https://example.com/video.mp4,direct,Comedy,BATCH-2024-002,1h 45min,false,false
Sample Movie 3,Thrilling sci-fi adventure,https://via.placeholder.com/300x450?text=Movie3,https://www.youtube.com/watch?v=example,youtube,"Sci-Fi,Thriller",BATCH-2024-003,2h 30min,true,true`;
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="sample-movies.csv"');
  res.send(sampleCSV);
});

// Create movie
router.post('/movie', protect, adminOnly, async (req, res) => {
  const movie = await Movie.create(req.body);
  res.json(movie);
});

// Bulk upload movies via CSV
router.post('/movies/bulk-csv', protect, adminOnly, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const movies = [];
    const fileBuffer = req.file.buffer.toString('utf8');
    const readableStream = Readable.from(fileBuffer);

    readableStream
      .pipe(csv())
      .on('data', (row) => {
        // Trim whitespace from all values and handle empty fields
        const cleanRow = {};
        Object.keys(row).forEach(key => {
          cleanRow[key.trim()] = row[key] ? row[key].trim() : '';
        });

        // Only add movies with a title
        if (cleanRow.title) {
          movies.push({
            title: cleanRow.title,
            description: cleanRow.description || '',
            poster: cleanRow.poster || '',
            videoUrl: cleanRow.videoUrl || '',
            videoType: cleanRow.videoType || 'direct',
            category: cleanRow.category ? cleanRow.category.split(',').map(c => c.trim()) : [],
            batchNo: cleanRow.batchNo || '',
            duration: cleanRow.duration || '',
            featured: cleanRow.featured === 'true' || cleanRow.featured === '1' || cleanRow.featured === 'TRUE',
            isPremium: cleanRow.isPremium === 'true' || cleanRow.isPremium === '1' || cleanRow.isPremium === 'TRUE'
          });
        }
      })
      .on('end', async () => {
        try {
          if (movies.length === 0) {
            return res.status(400).json({ message: 'No valid movies found in CSV. Make sure the file has a "title" column and at least one row with data.' });
          }
          
          // Check for duplicates by title and prevent insertion
          const existingTitles = await Movie.find({
            title: { $in: movies.map(m => m.title) }
          }).select('title');
          
          const existingTitleSet = new Set(existingTitles.map(m => m.title));
          const newMovies = movies.filter(m => !existingTitleSet.has(m.title));
          const duplicates = movies.filter(m => existingTitleSet.has(m.title));
          
          if (newMovies.length === 0) {
            return res.status(400).json({ 
              message: 'All videos are duplicates. No new videos were added.',
              duplicates: duplicates.map(m => m.title)
            });
          }
          
          const createdMovies = await Movie.insertMany(newMovies);
          
          const response = { 
            success: true, 
            count: createdMovies.length, 
            movies: createdMovies
          };
          
          if (duplicates.length > 0) {
            response.warning = `${duplicates.length} duplicate(s) skipped: ${duplicates.map(m => m.title).join(', ')}`;
            response.duplicates = duplicates.map(m => m.title);
          }
          
          res.json(response);
        } catch (error) {
          res.status(500).json({ message: 'Database error: ' + error.message });
        }
      })
      .on('error', (error) => {
        res.status(500).json({ message: 'CSV parsing error: ' + error.message });
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Bulk upload movies (JSON - keep for backward compatibility)
router.post('/movies/bulk', protect, adminOnly, async (req, res) => {
  try {
    const { movies } = req.body;
    if (!Array.isArray(movies)) {
      return res.status(400).json({ message: 'Movies must be an array' });
    }
    const createdMovies = await Movie.insertMany(movies);
    res.json({ 
      success: true, 
      count: createdMovies.length, 
      movies: createdMovies 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update movie
router.put('/movie/:id', protect, adminOnly, async (req, res) => {
  const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(movie);
});

// Delete
router.delete('/movie/:id', protect, adminOnly, async (req, res) => {
  await Movie.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

// ==================== CATEGORY ROUTES ====================

// Get all categories
router.get('/categories', protect, adminOnly, async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  res.json(categories);
});

// Create category
router.post('/category', protect, adminOnly, async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update category
router.put('/category/:id', protect, adminOnly, async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(category);
});

// Delete category
router.delete('/category/:id', protect, adminOnly, async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ message: 'Category deleted' });
});

// ==================== USER MANAGEMENT ROUTES ====================

// List users (admin)
router.get('/users', protect, adminOnly, async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});

// Update user subscription (removed expiry)
router.put('/user/:id/subscription', protect, adminOnly, async (req, res) => {
  try {
    const { subscription, subscribedCategories } = req.body;
    const updates = {};
    
    if (subscription) updates.subscription = subscription;
    if (subscribedCategories) updates.subscribedCategories = subscribedCategories;
    
    const user = await User.findByIdAndUpdate(
      req.params.id, 
      updates, 
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update user status (active/revoked)
router.put('/user/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body; // 'active' or 'revoked'
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Prevent revoking admin@netflix.com
    if (user.email === 'admin@netflix.com' && status === 'revoked') {
      return res.status(403).json({ message: 'Cannot revoke the main admin account' });
    }
    
    if (status === 'revoked') {
      // Revoke access: clear all categories and set as inactive
      user.isActive = false;
      user.subscribedCategories = [];
      user.subscription = 'free';
    } else if (status === 'active') {
      user.isActive = true;
    }
    
    await user.save();
    
    res.json({ 
      user: { 
        ...user.toObject(), 
        password: undefined 
      },
      message: `User ${status === 'revoked' ? 'access revoked' : 'activated'}` 
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Toggle user active status (kept for backward compatibility)
router.put('/user/:id/toggle-status', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.isActive = !user.isActive;
    await user.save();
    
    res.json({ isActive: user.isActive, message: `User ${user.isActive ? 'activated' : 'deactivated'}` });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete user
router.delete('/user/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Prevent deleting admin@netflix.com
    if (user.email === 'admin@netflix.com') {
      return res.status(403).json({ message: 'Cannot delete the main admin account' });
    }
    
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
