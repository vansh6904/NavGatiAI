// Login.jsx
import React, { useState } from 'react';
import axios from "axios";
import { useDispatch } from "react-redux";
import { login } from "../../Store/authSlice";
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { toast } from 'sonner';

function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (formData.username.length < 4 || formData.password.length < 8) return 'Invalid username or password.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
        toast.error(validationError, {
            id: 'error',
            duration: 2000,
            style: {
                background: '#dc2626',
                color: '#fff',
                border: '1px solid #b91c1c',
            },
        });
        return;
    }

    setLoading(true);
    const toastId = toast.loading('Signing in...');

    try {
        const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/users/login`, formData, {
            withCredentials: true,
        });

        dispatch(login(response.data.data));

        toast.success('Login successful!', {
            id: toastId,
            duration: 2000,
            style: {
                background: '#059669',
                color: '#fff',
                border: '1px solid #047857',
            },
        });

        setTimeout(() => navigate('/'), 2000);
    } catch (err) {
        const errorMessage = err.response?.data?.message || 'An error occurred. Please try again.';
        toast.error(errorMessage, {
            id: toastId,
            duration: 3000,
            style: {
                background: '#dc2626',
                color: '#fff',
                border: '1px solid #b91c1c',
            },
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
          Welcome Back
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-300 mb-2 font-medium">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-700/50 rounded-lg border border-gray-600/50 focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-100 placeholder-gray-400"
              placeholder="Enter your username"
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
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </motion.button>

          <p className="text-center text-gray-400 mt-6">
            New User?{' '}
            <NavLink 
              to="/register" 
              className="text-teal-400 hover:text-teal-300 font-medium"
            >
              Register here
            </NavLink>
          </p>
        </form>
      </motion.div>
    </div>
  );
}

export default Login;