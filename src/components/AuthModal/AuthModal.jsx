import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import './AuthModal.css';

function AuthModal({ onClose, message }) {
  const { theme } = useTheme();
  const { t } = useLanguage();

  return (
    <div className={`modal-overlay ${theme}`}>
      <div className={`modal-content ${theme}`}>
        <h3>{message || t('authRequired')}</h3>
        <p>{t('pleaseLoginOrRegister')}</p>
        
        <div className="modal-buttons">
          <button className="modal-button" onClick={onClose}>
            {t('cancel')}
          </button>
          <button 
            className="modal-button primary"
            onClick={() => {
              onClose();
              window.location.href = '/login';
            }}
          >
            {t('login')}
          </button>
          <button 
            className="modal-button secondary"
            onClick={() => {
              onClose();
              window.location.href = '/register';
            }}
          >
            {t('register')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthModal;