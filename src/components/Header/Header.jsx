import { Link } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import './Header.css';

export default function Header({ user, onLogout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const { theme, toggleTheme } = useTheme();
  const { t, toggleLanguage, language } = useLanguage();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogoutClick = () => {
    onLogout();
    setIsMenuOpen(false);
  };

  return (
    <header className={`header ${theme}`}>
      <nav className="nav-container">
        <div className="logo-container">
          <Link to="/" className="logo">
            Rent-a-Car
          </Link>
        </div>

        <div className="controls">
          <button 
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label={t('toggleTheme')}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          <button 
            onClick={toggleLanguage}
            className="language-toggle"
            aria-label={t('toggleLanguage')}
          >
            {language === 'en' ? 'RU' : 'EN'}
          </button>

          <div ref={menuRef} className="menu-wrapper">
            <button
              className="menu-button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={t('menu')}
            >
              ☰
            </button>

            <div className={`dropdown-menu ${isMenuOpen ? 'open' : ''}`}>
              {/* Всегда доступные ссылки */}
              <Link to="/" className="dropdown-link" onClick={() => setIsMenuOpen(false)}>
                {t('home')}
              </Link>
              <Link to="/cars" className="dropdown-link" onClick={() => setIsMenuOpen(false)}>
                {t('cars')}
              </Link>
              <Link to="/reviews" className="dropdown-link" onClick={() => setIsMenuOpen(false)}>
                {t('reviews')}
              </Link>

              {/* Ссылки для авторизованных пользователей */}
              {user && (
                <>
                  <Link to="/bookings" className="dropdown-link" onClick={() => setIsMenuOpen(false)}>
                    {t('myBookings')}
                  </Link>
                  <Link to="/profile" className="dropdown-link" onClick={() => setIsMenuOpen(false)}>
                    {t('profile')}
                  </Link>
                </>
              )}

              {/* Ссылки для администраторов */}
              {user?.role === 'admin' && (
                <>
                  <Link to="/admin/dashboard" className="dropdown-link" onClick={() => setIsMenuOpen(false)}>
                    {t('adminPanel')}
                  </Link>
                  <Link to="/admin/bookings" className="dropdown-link" onClick={() => setIsMenuOpen(false)}>
                    {t('allBookings')}
                  </Link>
                </>
              )}

              {/* Ссылки для неавторизованных пользователей */}
              {!user && (
                <>
                  <Link to="/login" className="dropdown-link" onClick={() => setIsMenuOpen(false)}>
                    {t('login')}
                  </Link>
                  <Link to="/register" className="dropdown-link" onClick={() => setIsMenuOpen(false)}>
                    {t('register')}
                  </Link>
                </>
              )}

              {/* Кнопка выхода */}
              {user && (
                <Link 
                  to="/" 
                  className="dropdown-link" 
                  onClick={(e) => {
                    e.preventDefault();
                    handleLogoutClick();
                  }}
                >
                  {t('logout')}
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}