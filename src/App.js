import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { Layout } from './components/Layout/Layout';
import Home from './pages/Home/Home';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import CarsPublicPage from './pages/CarsPublicPage/CarsPublicPage';
import CarsPrivatePage from './pages/CarsPrivatePage/CarsPrivatePage';
import ProfilePage from './pages/Profile/ProfilePage';
import ReviewsPage from './pages/Reviews/ReviewsPage';
import BookingsPage from './pages/Bookings/BookingsPage';
import AdminDashboard from './pages/Admin/AdminDashboard';
import NotFoundPage from './pages/NotFound/NotFoundPage';

import './styles.css';

const ProtectedRoute = ({ children, requiredRole }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && String(user.role) !== String(requiredRole)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  useEffect(() => {
    const handleStorageChange = () => {
      const savedUser = localStorage.getItem('user');
      setUser(savedUser ? JSON.parse(savedUser) : null);
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout user={user} onLogout={handleLogout} />}>
              {/* Public routes */}
              <Route index element={<Home />} />
              <Route path="login" element={<LoginPage onLogin={handleLogin} />} />
              <Route path="register" element={<RegisterPage />} />
              <Route 
                path="cars" 
                element={user ? <CarsPrivatePage user={user} /> : <CarsPublicPage />} 
              />
              <Route path="reviews" element={<ReviewsPage />} />
              
              {/* Protected user routes */}
              <Route path="profile" element={
                <ProtectedRoute>
                  <ProfilePage user={user} />
                </ProtectedRoute>
              } />
              
              <Route path="bookings" element={
                <ProtectedRoute>
                  <BookingsPage user={user} />
                </ProtectedRoute>
              } />

              {/* Admin routes */}
              <Route path="admin/dashboard" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard user={user} />
                </ProtectedRoute>
              } />
              
              <Route path="admin/bookings" element={
                <ProtectedRoute requiredRole="admin">
                  <BookingsPage showAll={true} />
                </ProtectedRoute>
              } />

              {/* Error handling */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;