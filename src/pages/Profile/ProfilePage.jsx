import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { changePassword } from '../../api/auth';
import './ProfilePage.css';

function ProfilePage({ user }) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setUserData(user);
  }, [user, navigate]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setMessage({ text: t('passwordMismatch'), type: 'error' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ text: t('passwordLength'), type: 'error' });
      return;
    }

    try {
      const response = await changePassword(
        user.id,
        currentPassword,
        newPassword
      );
      
      if (response.success) {
        setMessage({ text: t('passwordChangeSuccess'), type: 'success' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ text: response.message, type: 'error' });
      }
    } catch (error) {
      setMessage({ text: t('passwordChangeError'), type: 'error' });
      console.error(t('error'), error);
    }
  };

  if (!userData) {
    return <div className="loading">{t('loading')}</div>;
  }

  return (
    <div className={`profile-container ${theme}`}>
      <div className="profile-info">
        <div className="info-section">
          <h2>{t('personalInfo')}</h2>
          <div className="info-item">
            <span className="info-label">{t('name')}:</span>
            <span className="info-value">{userData.name}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Email:</span>
            <span className="info-value">{userData.email}</span>
          </div>

        </div>

        <div className="password-section">
          <h2>{t('changePassword')}</h2>
          <form onSubmit={handlePasswordChange}>
            <div className="form-group">
              <label htmlFor="currentPassword">{t('currentPassword')}:</label>
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="newPassword">{t('newPassword')}:</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">{t('confirmPassword')}:</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            
            {message.text && (
              <div className={`message ${message.type}`}>
                {message.text}
              </div>
            )}
            
            <button type="submit" className="submit-btn">
              {t('changePasswordButton')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;