import React, { useState } from 'react';
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { NavLink } from 'react-router-dom';

function Register() {
  const [formData, setFormData] = useState({
    fullname: '',
    username: '',
    password: '',
    usertype: '',
    email: '',
    phoneNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.fullname.trim()) return 'Fullname is required';
    if (formData.username.length < 4) return 'Username must be at least 4 characters';
    if (formData.password.length < 8) return 'Password must be at least 8 characters';
    if (!formData.usertype) return 'Usertype is required';
    if (!formData.phoneNumber.trim()) return 'Phone number is required';
    if (!/^\d{10}$/.test(formData.phoneNumber)) return 'Phone number must be 10 digits';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Invalid email address';
    const passwordStrength = {
      hasUpper: /[A-Z]/.test(formData.password),
      hasLower: /[a-z]/.test(formData.password),
      hasNumber: /[0-9]/.test(formData.password),
      hasSpecial: /[^A-Za-z0-9]/.test(formData.password)
    };
    if (!(passwordStrength.hasUpper && passwordStrength.hasLower && 
      passwordStrength.hasNumber && passwordStrength.hasSpecial)) {
      return 'Password must contain at least:\n- One uppercase letter\n- One lowercase letter\n- One number\n- One special character';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) return toast.error(validationError);

    setLoading(true);
    const toastId = toast.loading('Creating account...');
    
    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/users/register`, formData);
      
      toast.success('Registration successful!', {
        id: toastId,
        duration: 2000,
      });
      
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'An error occurred. Please try again.';
      toast.error(errorMessage, {
        id: toastId,
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-xl p-8 border border-gray-700/30"
      >
        <h2 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
          Create Account
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-300 mb-2 font-medium">Full Name</label>
            <input
              type="text"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-700/50 rounded-lg border border-gray-600/50 focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-100 placeholder-gray-400"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2 font-medium">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-700/50 rounded-lg border border-gray-600/50 focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-100 placeholder-gray-400"
              placeholder="Choose a username"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2 font-medium">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-700/50 rounded-lg border border-gray-600/50 focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-100 placeholder-gray-400"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2 font-medium">Phone Number</label>
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-700/50 rounded-lg border border-gray-600/50 focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-100 placeholder-gray-400"
              placeholder="Enter your phone number"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2 font-medium">Email (Optional)</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-700/50 rounded-lg border border-gray-600/50 focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-100 placeholder-gray-400"
              placeholder="Enter your email (optional)"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2 font-medium">Account Type</label>
            <div className="grid grid-cols-2 gap-4" required>
              <label className={`flex items-center justify-center p-4 rounded-lg cursor-pointer transition-colors 
                ${formData.usertype === 'user' ? 'bg-teal-600/30 border border-teal-500/50' : 'bg-gray-700/50 border border-gray-600/50 hover:border-teal-500/30'}`}>
                <input
                  type="radio"
                  name="usertype"
                  value="user"
                  checked={formData.usertype === "user"}
                  onChange={handleChange}
                  className="hidden"
                />
                <span className="text-gray-200">User</span>
              </label>
              
              <label className={`flex items-center justify-center p-4 rounded-lg cursor-pointer transition-colors 
                ${formData.usertype === 'entrepreneur' ? 'bg-cyan-600/30 border border-cyan-500/50' : 'bg-gray-700/50 border border-gray-600/50 hover:border-cyan-500/30'}`}>
                <input
                  type="radio"
                  name="usertype"
                  value="entrepreneur"
                  checked={formData.usertype === "entrepreneur"}
                  onChange={handleChange}
                  className="hidden"
                />
                <span className="text-gray-200">Entrepreneur</span>
              </label>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </motion.button>

          <p className="text-center text-gray-400 mt-6">
            Already have an account?{' '}
            <NavLink 
              to="/login" 
              className="text-teal-400 hover:text-teal-300 font-medium"
            >
              Login here
            </NavLink>
          </p>
        </form>
      </motion.div>
    </div>
  );
}

export default Register;