// src/controllers/scrapeController.js
import { getNewsItems } from '../Services/scrap.services.js';

// Controller to fetch news items
export const fetchNews = async (req, res) => {
    try {
        const newsItems = await getNewsItems();
        res.status(200).json({
            success: true,
            data: newsItems,
        });
    } catch (error) {
        console.error('Error fetching news items:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch news items',
        });
    }
};