import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { register } from '../../api/auth';
import './AuthPage.css';

function RegisterPage({ onRegister }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [status, setStatus] = useState({
    loading: false,
    error: '',
    success: ''
  });
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { t } = useLanguage();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Сбрасываем статус ошибки при изменении данных
    if (status.error) setStatus(prev => ({ ...prev, error: '' }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setStatus(prev => ({ ...prev, error: t('nameRequired') }));
      return false;
    }
    if (!formData.email.trim()) {
      setStatus(prev => ({ ...prev, error: t('emailRequired') }));
      return false;
    }
    if (!formData.password) {
      setStatus(prev => ({ ...prev, error: t('passwordRequired') }));
      return false;
    }
    if (formData.password.length < 6) {
      setStatus(prev => ({ ...prev, error: t('passwordTooShort') }));
      return false;
    }
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) return;

    setStatus({ loading: true, error: '', success: '' });

    try {
      const response = await register(
        formData.name,
        formData.email,
        formData.password
      );

      if (response?.success) {
        setStatus({
          loading: false,
          error: '',
          success: t('registrationSuccess')
        });
        
        onRegister({
          email: formData.email,
          name: formData.name,
          id: response.userId,
          role: response.role || 'user'
        });

        // Перенаправляем через 2 секунды после показа сообщения
        setTimeout(() => {
          navigate('/login', {
            state: { registeredEmail: formData.email }
          });
        }, 2000);
      } else {
        setStatus({
          loading: false,
          error: response?.message || t('registrationFailed'),
          success: ''
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setStatus({
        loading: false,
        error: error.response?.data?.message || t('registrationError'),
        success: ''
      });
    }
  };

  return (
    <div className={`auth-wrapper ${theme}`}>
      <div className="auth-container">
        <Link to="/" className="nav-link">{t('home')}</Link>
        <h1>{t('registerTitle')}</h1>
        
        {status.success && (
          <div className="success-message">
            <p>{status.success}</p>
            <p>{t('redirectingToLogin')}</p>
          </div>
        )}

        {!status.success && (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>{t('nameLabel')}</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={status.loading}
              />
            </div>
            
            <div className="form-group">
              <label>{t('emailLabel')}</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={status.loading}
              />
            </div>
            
            <div className="form-group">
              <label>{t('passwordLabel')}</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={status.loading}
                minLength="6"
                placeholder={t('passwordPlaceholder')}
              />
              <small className="password-hint">{t('passwordHint')}</small>
            </div>
            
            {status.error && <div className="error-message">{status.error}</div>}
            
            <button 
              type="submit" 
              className="auth-button"
              disabled={status.loading}
            >
              {status.loading ? t('registering') : t('registerButton')}
            </button>
          </form>
        )}
        
        <p className="auth-link">
          {t('haveAccount')} <Link to="/login">{t('login')}</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;