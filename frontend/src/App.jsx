import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './components/Home';
import About from './components/About';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import { fetchCurrentUser } from './api';
import Footer from './components/Footer';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkUser = async () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const userData = await fetchCurrentUser(token);
        setUser(userData);
      } catch (error) {
        console.error('Nepodařilo se načíst uživatele:', error);
        localStorage.removeItem('access_token');
        setUser(null);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    checkUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    window.location.reload(); 
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-graphit-dark-blue text-graphit-white">
        Načítám...
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <Router>
        {user ? (
          <div className="flex flex-col min-h-screen">
            <div className='bg-graphit-dark-blue'>
              <Navbar user={user} onLogout={handleLogout} />
            </div>
            <div className="flex flex-1 blender-grid-bg flex-row items-stretch relative z-10">
              <Sidebar user={user} />
              <main className="flex-grow overflow-hidden">
                <Routes>
                  <Route path="/dashboard" element={<UserDashboard user={user} />} />
                  <Route path="/admin" element={<AdminDashboard user={user} />} />
                  <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
              </main>
            </div>
            <Footer />
          </div>
        ) : (
          <div className="flex flex-col min-h-screen bg-graphit-dark-blue">
            <div className='bg-graphit-dark-blue z-20 relative'>
              <Navbar user={user} onLogout={handleLogout} />
            </div>
            <div className="flex-grow flex flex-col blender-grid-bg relative z-10 overflow-hidden">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<Login onLoginSuccess={checkUser} />} />
                <Route path="*" element={<Navigate to="/login" />} />
              </Routes>
            </div>
            <div className="z-20 relative">
              <Footer />
            </div>
          </div>
        )}
      </Router>
    </DndProvider>
  );
}

export default App;