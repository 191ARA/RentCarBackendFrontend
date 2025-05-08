import { useEffect, useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import SiteReviewForm from './SiteReviewForm';
import SiteReviewList from './SiteReviewList';
import './ReviewsPage.css';

export default function ReviewsPage() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <main className={`reviews-page ${theme}`}>
      <div className="reviews-container">
        <h1 className="reviews-title">{t('reviewsTitle')}</h1>

        {user && (
          <div className="review-form-section">
            <h2>{t('leaveReview')}</h2>
            <SiteReviewForm
              user={user}
              onReviewAdded={() => setRefreshKey(prev => prev + 1)}
            />
          </div>
        )}

        <div className="reviews-grid-wrapper">
          <SiteReviewList key={refreshKey} />
        </div>
      </div>
    </main>
  );
}