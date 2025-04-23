import React,{useState,useEffect} from 'react'; 
import Header from './components/Navbar/Header';
import { Outlet } from 'react-router-dom';
import {login,logout} from './Store/authSlice';
import { useDispatch } from "react-redux";
import axios from 'axios';
import { Toaster } from 'sonner';

function App() {

  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true)

  const getCurrentUser = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/v1/users/current-user', {
        withCredentials: true, 
      });
      console.log('response:', response.data);
      
      // Ensure data is not null before accessing its properties
      if (response.data.data && response.data.data !== null) {
        dispatch(login(response.data.data));
      } 
      else {
        dispatch(logout());
      }
    } catch (err) {
      console.error('Error fetching current user:', err.response?.data?.message || err.message);
      dispatch(logout()); 
    }
  };
  

  useEffect(() => {
    getCurrentUser();
  }, []);


  return (
    <div className="app-container">
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#1f2937',
            color: '#fff',
            border: '1px solid #374151'
          },
        }}
        visibleToasts={3}
        expand={true}
      />
      <Header />
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

export default App;
