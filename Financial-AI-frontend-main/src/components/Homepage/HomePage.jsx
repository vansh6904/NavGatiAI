import React, { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../ui/card";
import { Instagram, Facebook, Twitter, Linkedin, ArrowRight, Sparkles, Gem, Trophy, TrendingUp } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useSelector } from "react-redux";
import image from "../../assets/women-logo.png"
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const [isVisible, setIsVisible] = useState({ journey: false, stories: false });
  const journeyRef = useRef(null);
  const storiesRef = useRef(null);

  const userData = useSelector(state => state.auth.userData);
  const firstname = userData?.fullname?.split(" ")[0] || "Guest";
  const lastname = userData?.fullname?.split(" ")[1] || "User";

  // Framer Motion scroll effects
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0.8]);
  const y = useTransform(scrollYProgress, [0, 0.1], [0, 100]);

  useEffect(() => {
    const handleScroll = () => {
      const observeElement = (ref, key) => {
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect();
          const isInView = rect.top <= window.innerHeight * 0.75;
          setIsVisible(prev => ({ ...prev, [key]: isInView }));
        }
      };
      observeElement(journeyRef, 'journey');
      observeElement(storiesRef, 'stories');
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100">
      <main className="pt-24 px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.section className="text-center max-w-4xl mx-auto" style={{ opacity, y }}>
          <div className="relative inline-block mb-12">
            <motion.div 
              initial={{ scale: 0.9 }} 
              animate={{ scale: 1 }} 
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 blur-md opacity-20 -z-10"></div>
              <img
                src={`https://ui-avatars.com/api/?name=${firstname}+${lastname}&color=007bff&background=e0e0e0`}
                alt="Profile"
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-full shadow-2xl border-4 border-gray-700/50 mb-8 object-cover"
              />
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-block bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-6 py-3 rounded-full shadow-lg text-sm sm:text-base font-medium hover:shadow-teal-500/20 transition-all duration-300"
            >
              Welcome back, {userData?.username || "Guest"} <Sparkles className="inline ml-2 w-4 h-4" />
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Card className="max-w-2xl mx-auto p-6 bg-gray-800/60 border-gray-700/50 backdrop-blur-sm hover:shadow-lg transition-shadow duration-300">
              <CardContent className="space-y-4">
                <p className="text-lg sm:text-xl italic text-gray-200">
                  "A woman with a voice is, by definition, a strong woman."
                </p>
                <p className="text-sm text-gray-400">- Melinda Gates</p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.section>

        {/* Content Sections */}
        <section className="max-w-6xl mx-auto space-y-12 py-12">
          <motion.div
            ref={journeyRef}
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible.journey ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
              Your Financial Journey
            </h2>
            <Card className="p-6 bg-gray-800/60 border-gray-700/50 backdrop-blur-sm hover:shadow-lg transition-shadow duration-300">
              <CardContent className="space-y-4">
                <p className="text-gray-300 leading-relaxed">
                  Welcome to your personal financial empowerment hub. Here, you'll find tools,
                  resources, and a supportive community to help you achieve your financial goals.
                </p>
                <Button className="mt-4 group bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 transition-all"
                onClick={() => (window.location.href = "http://localhost:5173/register")}>
                  Explore Resources
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            ref={storiesRef}
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible.stories ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <Card className="h-full transition-all hover:scale-[1.02] bg-gray-800/60 border-gray-700/50 hover:border-teal-400/30 backdrop-blur-sm hover:shadow-lg">
              <CardHeader>
                <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4 bg-gradient-to-br from-teal-900/50 to-teal-800/50">
                  <Gem className="w-6 h-6 text-teal-300" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-100">Real Results</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 leading-relaxed">
                  Member Achievements in Financial Growth
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="link" className="p-0 text-teal-400 hover:text-teal-300">
                  Read stories <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>

            <Card className="h-full transition-all hover:scale-[1.02] bg-gray-800/60 border-gray-700/50 hover:border-cyan-400/30 backdrop-blur-sm hover:shadow-lg">
              <CardHeader>
                <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4 bg-gradient-to-br from-cyan-900/50 to-cyan-800/50">
                  <Trophy className="w-6 h-6 text-cyan-300" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-100">Financial Wins</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 leading-relaxed">
                  Inspiring Journeys from Our Community
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="link" className="p-0 text-cyan-400 hover:text-cyan-300">
                  Learn more <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>

            <Card className="h-full transition-all hover:scale-[1.02] bg-gray-800/60 border-gray-700/50 hover:border-emerald-400/30 backdrop-blur-sm hover:shadow-lg">
              <CardHeader>
                <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4 bg-gradient-to-br from-emerald-900/50 to-emerald-800/50">
                  <TrendingUp className="w-6 h-6 text-emerald-300" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-100">From Goals to Reality</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 leading-relaxed">
                  How Members Are Thriving
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="link" className="p-0 text-emerald-400 hover:text-emerald-300">
                  Discover how <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-800 bg-gradient-to-br from-gray-900 to-gray-800/90 text-gray-300 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4 flex items-center text-gray-100">
                <Sparkles className="mr-2 h-4 w-4 text-teal-400" />
                About Us
              </h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">Our Mission</a></li>
                <li><a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">Team</a></li>
                <li><a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4 text-gray-100">Quick Links</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Resources</a></li>
                <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Events</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4 text-gray-100">Support</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4 text-gray-100">Connect</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-sky-400 transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center">
            <p className="text-sm sm:text-base text-gray-500">
              &copy; {new Date().getFullYear()} Financial Independence Platform. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;