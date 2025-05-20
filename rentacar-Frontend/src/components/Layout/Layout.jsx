import React from 'react';
import { Outlet } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import './Layout.css';

export function Layout({ user = null, onLogout = () => {} }) {
  const { theme } = useTheme();

  return (
    <div className={`layout ${theme}`}>
      <Header 
        user={user} 
        onLogout={onLogout} 
      />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}