// src/utils/scrapeUtils.js
import axios from 'axios';
import { load } from 'cheerio';

// Function to scrape a single URL
export const scrapeUrl = async (url) => {
    try {
        const { data } = await axios.get(url);
        const $ = load(data);
        const newsItems = [];

        // Check for the first structure
        $('.story_list').each((index, element) => {
            const title = $(element).find('h2 a').attr('title') || $(element).find('h2 a').text().trim();
            const summary = $(element).find('p.wrapLines.l3').text().trim();
            const link = $(element).find('h2 a').attr('href');
            const image = $(element).find('img').attr('src');
            const time = $(element).find('time').text().trim();

            // Convert relative URLs to absolute URLs if necessary
            const absoluteLink = link ? new URL(link, url).href : null;

            if (title && summary && absoluteLink) {
                newsItems.push({
                    title,
                    summary,
                    link: absoluteLink,
                    image,
                    time
                });
            } else {
                console.log("Incomplete data for element:", element);
            }
        });

        // Check for the second structure
        $('.eachStory').each((index, element) => {
            const title = $(element).find('h3 a').attr('title') || $(element).find('h3 a').text().trim();
            const summary = $(element).find('p.wrapLines.l5').text().trim();
            const link = $(element).find('h3 a').attr('href');
            const image = $(element).find('img').attr('src');
            const time = $(element).find('time').text().trim();

            // Convert relative URLs to absolute URLs if necessary
            const absoluteLink = link ? new URL(link, url).href : null;

            if (title && summary && absoluteLink) {
                newsItems.push({
                    title,
                    summary,
                    link: absoluteLink,
                    image,
                    time
                });
            } else {
                console.log("Incomplete data for element:", element);
            }
        });

        return newsItems;
    } catch (error) {
        console.error(`Error fetching or parsing the page (${url}):`, error);
        return []; // Return an empty array if there's an error
    }
};

// Function to scrape all URLs and combine results
export const scrapeAllUrls = async (urls) => {
    const allNewsItems = [];

    for (const url of urls) {
        const newsItems = await scrapeUrl(url);
        allNewsItems.push(...newsItems); // Combine results into a single array
    }

    return allNewsItems;
};