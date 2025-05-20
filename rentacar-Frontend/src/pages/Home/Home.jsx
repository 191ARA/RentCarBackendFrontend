import { useTheme } from '../../contexts/ThemeContext'; 
import { useLanguage } from '../../contexts/LanguageContext';
import { Link } from 'react-router-dom';
import './Home.css';

import darkBackground from '../../images/darkhome.jpg';
import lightBackground from '../../images/lighthome.jpg';

export default function Home() {
  const { theme } = useTheme();
  const { t } = useLanguage();

  const backgroundImages = {
    light: lightBackground,
    dark: darkBackground
  };

  return (
    <div className={`home ${theme}`}>
      <div 
        className="hero-section"
        style={{ backgroundImage: `url(${backgroundImages[theme]})` }}
      >
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>{t('rentPremiumCars')}</h1>
          <h2 className="subtitle">{t('heroSubtitle')}</h2>

          <Link to="/cars">
            <button className="cta-button">
              {t('exploreCollection')}
            </button>
          </Link>
          
        </div>
      </div>

      <div className="features-section">
        <h2>{t('whyChooseUs')}</h2>
        <div className="features-grid">
          {[1, 2, 3].map((item) => (
            <div key={item} className="feature-card">
              <div className="feature-icon">
                {item === 1 ? '🚗' : item === 2 ? '💰' : '🛡️'}
              </div>
              <h3>{t(`featureTitle${item}`)}</h3>
              <p>{t(`featureDesc${item}`)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="advantages-section">
        <div className="advantages-overlay">
          <p className="advantages-text">{t('fixedPrepayment')}</p>
        </div>
      </div>


      <div className="booking-steps-section">
        <div className="container">
          <h2>{t('howToBook')}</h2>
          <div className="steps">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="step">
                <span className="step-number">{step}</span>
                <h3>{t(`stepTitle${step}`)}</h3>
                <p>{t(`stepDesc${step}`)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
