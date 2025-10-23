import express from 'express';
import Movie from '../models/Movie.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get movies - Show ALL movies to everyone, frontend handles premium badges
router.get('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    let filter = {};
    let user = null;
    
    // Check if user is logged in (for logging purposes only)
    if (token) {
      try {
        const jwt = await import('jsonwebtoken');
        const User = await import('../models/User.js');
        const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
        user = await User.default.findById(decoded.id).select('-password');
        
        if (user && user.role === 'admin') {
          console.log('Admin user - showing all movies');
        } else if (user) {
          console.log('Regular user - showing all movies with premium badges on frontend');
        }
      } catch (err) {
        console.log('Invalid token - showing all movies for guest');
      }
    } else {
      console.log('No token - showing all movies for guest');
    }
    
    // Apply query filters (search, category filter, featured)
    const { q, category, featured } = req.query;
    if (q) filter.title = new RegExp(q, 'i');
    if (category) filter.category = category;
    if (featured) filter.featured = featured === 'true';
    
    console.log('Final filter:', filter);
    const movies = await Movie.find(filter).sort({ createdAt: -1 }).limit(100);
    console.log('Movies found:', movies.length);
    res.json(movies);
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  const movie = await Movie.findById(req.params.id);
  if (!movie) return res.status(404).json({ message: 'Not found' });
  res.json(movie);
});

// Check video access - requires authentication
router.get('/:id/access', protect, async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: 'Movie not found' });

    // Check if user has access to any of the movie's categories
    const hasCategory = movie.category.some(cat => 
      req.user.hasAccessToCategory(cat)
    );

    if (hasCategory) {
      return res.json({ hasAccess: true, reason: 'category-subscription' });
    }

    res.json({ hasAccess: false, reason: 'no-category-access' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
