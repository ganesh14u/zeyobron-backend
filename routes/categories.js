import express from 'express';
import Category from '../models/Category.js';

const router = express.Router();

// Get all categories (public)
router.get('/', async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  res.json(categories);
});

export default router;
