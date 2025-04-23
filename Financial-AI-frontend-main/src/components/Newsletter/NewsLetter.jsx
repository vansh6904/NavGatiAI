import React, { useState } from 'react';
import axios from 'axios';
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { cn } from "../ui/utils";
import { toast } from 'sonner';

function NewsLetter() {
  const [news, setNews] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/scrape/news`);
      
      if (response.data.success) {
        setNews(response.data.data);
        toast.success('News fetched successfully', {
          position: 'top-center',
          style: {
            background: '#059669',
            color: 'white',
            border: 'none'
          }
        });
      } else {
        toast.error('Failed to fetch news data', {
          position: 'top-center',
          style: {
            background: '#dc2626',
            color: 'white',
            border: 'none'
          }
        });
      }
    } catch (err) {
      setError('Failed to fetch news. Please try again later.');
      toast.error('Network error - failed to fetch news', {
        position: 'top-center',
        style: {
          background: '#dc2626',
          color: 'white',
          border: 'none'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-8xl mx-auto">
        <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl backdrop-blur-sm p-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent mb-8">
            Financial Updates
          </h1>

          {news.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
              <Button
                onClick={fetchNews}
                className={cn(
                  "bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500",
                  "text-white font-semibold py-6 px-8 rounded-xl",
                  "transform transition-all hover:scale-105"
                )}
              >
                Fetch Latest News
              </Button>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400"></div>
              <p className="mt-4 text-teal-400">Loading financial updates...</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item, index) => (
              <Card
                key={index}
                className="bg-gray-700/30 border border-gray-700/50 hover:border-teal-400/30 transition-all"
              >
                <CardContent className="p-0 overflow-hidden">
                  <div className="w-full h-48 relative overflow-hidden rounded-t-xl">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform hover:scale-105 mt-2"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900/90 to-transparent p-4">
                      <h2 className="text-lg font-semibold text-gray-100">
                        {item.title}
                      </h2>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-300 line-clamp-3 mb-4">
                      {item.summary}
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center p-4 border-t border-gray-700/50">
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-400 hover:text-cyan-400 flex items-center gap-2"
                  >
                    <span>Read Full Article</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M7 17L17 7M17 7H7M17 7V17" />
                    </svg>
                  </a>
                  <p className="text-sm text-gray-400">{item.time}</p>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewsLetter;