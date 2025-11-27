import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './components/Home';
import About from './components/About';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import { fetchCurrentUser } from './api';
import  Footer  from './components/Footer'

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
    <Router>
      {user ? (
        // UŽIVATEL JE PŘIHLÁŠEN: Zobrazíme dashboardový layout
        <div className="flex flex-col min-h-screen">
          
               <div className='bg-graphit-dark-blue'>
            <Navbar user={user} onLogout={handleLogout} />
        </div>
          <div className="flex flex-1 blender-grid-bg">
            <Sidebar user={user} />
            <main className="flex-grow">
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
        // UŽIVATEL NENÍ PŘIHLÁŠEN: Zobrazíme homepage layout
        <div className="flex flex-col min-h-screen ">
        <div className='bg-graphit-dark-blue'>
            <Navbar user={user} onLogout={handleLogout} />
        </div>
          <div className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/login" element={<Login onLoginSuccess={checkUser} />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </div>
          <Footer />
        </div>
      )}
    </Router>
  );
}

export default App;