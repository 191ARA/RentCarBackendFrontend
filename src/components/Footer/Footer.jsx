import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import './Footer.css';

export default function Footer() {
  const { t } = useLanguage();
  const { theme } = useTheme();

  return (
    <footer className={`footer ${theme}`}>
      <div className="footer-container">
        <p>© 2024 Rent-a-Car. {t('allRightsReserved')}</p>
      </div>
    </footer>
  );
}