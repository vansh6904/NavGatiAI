// src/routes/scrapeRoutes.js
import express from 'express';
import { fetchNews } from '../controllers/scrap.controller.js';

const router = express.Router();

// Route to fetch news items
router.get('/news', fetchNews);

export default router;