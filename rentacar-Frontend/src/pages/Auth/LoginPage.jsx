import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux'; // <-- Импортируем useDispatch
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { login } from '../../api/auth';
import { setUser } from '../../store/slices/authSlice'; // <-- Импортируем action
import './AuthPage.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch(); // <-- Подключаем Redux
  const { theme } = useTheme();
  const { t } = useLanguage();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      navigate('/');
    }

    // Устанавливаем email если он передан из регистрации
    if (location.state?.registeredEmail) {
      setEmail(location.state.registeredEmail);
    }
  }, [navigate, location.state]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await login(email, password);
      
      if (response.success) {
        const userData = {
          id: response.userId,
          email: email,
          role: response.role && response.role !== 'null' ? response.role : 'user',
          name: response.name || email
        };

        // Сохраняем пользователя через Redux
        dispatch(setUser(userData)); // <-- Теперь используем Redux вместо onLogin

        // Перенаправляем по роли
        navigate(response.role === 'admin' ? '/admin/dashboard' : '/');
        
        // Опционально: перезагружаем текущую страницу, чтобы обновить данные
        window.location.reload(); // <-- Автообновление страницы
      } else {
        setError(response.message || t('loginFailed'));
      }
    } catch (error) {
      setError(t('loginError'));
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`auth-wrapper ${theme}`}>
      <div className="auth-container">
        <Link to="/" className="nav-link">{t('home')}</Link>
        <h1>Login</h1>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="username"
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="current-password"
              disabled={isLoading}
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <p className="auth-link">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;