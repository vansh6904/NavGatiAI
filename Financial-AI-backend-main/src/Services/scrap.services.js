// src/services/scrapeService.js
import { scrapeAllUrls } from '../utils/scrap.utils.js';

// Array of URLs to scrape
const urls = [
    "https://economictimes.indiatimes.com/topic/rural",
    "https://economictimes.indiatimes.com/topic/rural-development-india",
    "https://economictimes.indiatimes.com/topic/financial-empowerment-of-rural"
];

// Function to get all news items
export const getNewsItems = async () => {
    const newsItems = await scrapeAllUrls(urls);
    return newsItems;
};