import React, { useEffect, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { logout } from "../../Store/authSlice";
import { motion } from "framer-motion";
import { Globe, Menu, X } from "lucide-react";
import {cn} from "../ui/utils"
import image from "../../assets/women-logo.png";

function Header() {
  const authstatus = useSelector((state) => state.auth.status);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showTranslate, setShowTranslate] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const userData = useSelector(state => state.auth.userData);
  const firstname = userData?.fullname?.split(" ")[0] || "Guest";
  const lastname = userData?.fullname?.split(" ")[1] || "User";
  
  const [showDetails, setShowDetails] = useState(false);

  const navItems = authstatus
    ? ["Home", "Chatbot", "Dashboard", "Microfinance", "Newsletter", "Community"]
    : ["Home", "Login", "Signup"];

  useEffect(() => {
    if (!window.googleTranslateElementInit) {
      const addScript = document.createElement("script");
      addScript.src =
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      addScript.async = true;
      document.body.appendChild(addScript);

      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "en,hi,kn,ml,mr,pa,ta,te,bn,gu,or,as,ur,ks,sd,sa,ne,si,bo,doi,brx,mni,ksf,kok",
            layout: window.google.translate.TranslateElement.InlineLayout.HORIZONTAL,
          },
          "google_translate_element"
        );
      };
    }
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_BASE_URL}/users/logout`, null, { withCredentials: true });
      dispatch(logout());
      navigate("/");
    } catch (err) {
      console.error('Logout failed:', err.response?.data?.message || err.message);
    }
  };

  return (
    <nav className="sticky top-0 w-full bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-teal-400 transition-colors"
          >
            {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <NavLink
                key={item}
                to={item === "Home" ? "/" : item === "Signup" ? "/register" : `/${item.toLowerCase()}`}
                className={({ isActive }) => cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white" 
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                )}
              >
                {item}
              </NavLink>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Google Translate */}
            <div className="relative">
              <button
                onClick={() => setShowTranslate(!showTranslate)}
                className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white rounded-md transition-colors"
              >
                <Globe className="w-5 h-5" />
                <span>Translate</span>
              </button>
              <div
                id="google_translate_element"
                className={`absolute top-12 right-0 bg-gray-800 rounded-lg shadow-xl p-3 ${
                  showTranslate ? "block" : "hidden"
                }`}
              />
            </div>

            {authstatus && (
              <>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
                >
                  Logout
                </button>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  onMouseEnter={() => setShowDetails(true)}
                  onMouseLeave={() => setShowDetails(false)}          
                  className="relative cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full blur opacity-30" />
                  <img
                    src={`https://ui-avatars.com/api/?name=${firstname}+${lastname}&color=007bff&background=e0e0e0`}
                    alt="Profile"
                    className="w-8 h-8 rounded-full border-2 border-gray-700"
                  />
                </motion.div>
                {showDetails && (
                    // <motion.div
                    //   initial={{ opacity: 0, y: 10 }}
                    //   animate={{ opacity: 1, y: 40 }}
                    //   exit={{ opacity: 0, y: 10 }}
                    //   className="absolute left-1/2 transform -translate-x-1/2 top-12 bg-gray-800 text-white p-3 font-bold text-xl rounded-lg shadow-lg text-sm"
                    // >
                    //   <p className="font-semibold">Name - {userData.fullname}</p><br></br>
                    //   <p className="font-semibold">Username - {userData.username}</p><br></br>
                    //   <p className="font-semibold">User Type - {userData.usertype}</p>
                    // </motion.div>

                    <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-1/2 transform -translate-x-1/2 top-12 z-50 w-72"
                  >
                    {/* Card */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden">
                      {/* Card Header */}
                      <div className="p-0">
                        <div className="h-20 bg-gradient-to-r bg-gray-800" />
                      </div>
            
                      {/* Card Content */}
                      <div className="px-4 pt-0 pb-4">
                        <div className="flex flex-col items-center -mt-10">
                          {/* Avatar */}
                          <div className="h-20 w-20 rounded-full border-4 border-white shadow-md overflow-hidden">
                            
                              <img
                                src={`https://ui-avatars.com/api/?name=${firstname}+${lastname}&color=007bff&background=e0e0e0`}                                
                                className="h-full w-full object-cover"
                              />
                            
                          </div>
            
                          <h3 className="mt-3 text-xl font-semibold text-gray-900">{userData.fullname}</h3>
            
                          {/* Badge */}
                          <div className="mt-1 px-3 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                            {userData.usertype}
                          </div>
            
                          <div className="w-full mt-4 space-y-2">
                            <div className="flex items-center gap-2 text-gray-600">
                              <span className="h-4 w-4 text-violet-500" />
                              <span className="text-sm">{userData.username}</span>
                            </div>
            
                            <div className="flex items-center gap-2 text-gray-600">
                              <span className="h-4 w-4 text-violet-500" />
                              <span className="text-sm">{userData.usertype} Account</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
            
)}

              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-gray-900 border-t border-gray-800">
            {navItems.map((item) => (
              <NavLink
                key={item}
                to={item === "Home" ? "/" : item === "Signup" ? "/register" : `/${item.toLowerCase()}`}
                className={({ isActive }) => cn(
                  "block px-4 py-3 text-sm font-medium transition-colors border-b border-gray-800",
                  isActive 
                    ? "bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-teal-400" 
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                )}
                onClick={() => setIsMobileOpen(false)}
              >
                {item}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Header;