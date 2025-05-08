import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import './SiteReviewList.css';

export default function SiteReviewList() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ average: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 6; // Изменили на 6 для формата 3x2

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reviewsRes, statsRes] = await Promise.all([
          axios.get('http://localhost:8080/api/site-reviews'),
          axios.get('http://localhost:8080/api/site-reviews/stats')
        ]);

        setReviews(reviewsRes.data);
        setStats({
          average: statsRes.data.averageRating,
          count: statsRes.data.totalReviews
        });
      } catch (error) {
        console.error(t('errorLoading'), error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [t]);

  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const half = Math.floor(maxVisiblePages / 2);
      let start = currentPage - half;
      let end = currentPage + half;

      if (start < 1) {
        start = 1;
        end = maxVisiblePages;
      } else if (end > totalPages) {
        end = totalPages;
        start = totalPages - maxVisiblePages + 1;
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    return pages;
  };

  if (loading) return <div className="loading">{t('loadingReviews')}</div>;

  return (
    <div className={`reviews-list-container ${theme}`}>
      <div className="reviews-stats">
        <h3>{t('overallRating')}</h3>
        <div className="average-rating">
          <span className="stars" aria-label={`Rating: ${stats.average.toFixed(1)} out of 5`}>
            {'★'.repeat(Math.round(stats.average)).padEnd(5, '☆')}
          </span>
          <span className="value">{stats.average.toFixed(1)}/5</span>
        </div>
        <p className="total-reviews">{t('basedOn', { count: stats.count })}</p>
      </div>

      <div className="reviews-grid">
        {currentReviews.length > 0 ? (
          currentReviews.map((review) => (
            <article key={review.id} className="review-card" aria-labelledby={`review-${review.id}-title`}>
              <header className="review-header">
                <div className="user-info">
                  <h4 id={`review-${review.id}-title`} className="user-name">{review.user.name}</h4>
                  <time className="review-date" dateTime={review.createdAt}>
                    {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                  </time>
                </div>
                <div className="review-rating" aria-label={`${review.rating} stars`}>
                  {'★'.repeat(review.rating).padEnd(5, '☆')}
                </div>
              </header>
              {review.comment && (
                <div className="review-comment">
                  <p>{review.comment}</p>
                </div>
              )}
            </article>
          ))
        ) : (
          <div className="no-reviews">{t('noReviews')}</div>
        )}
      </div>

      {totalPages > 1 && (
        <nav className="pagination" aria-label="Reviews pagination">
          <button
            className="nav-button"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            aria-label={t('previousPage')}
          >
            {t('previous')}
          </button>

          {getPageNumbers().map((page) => (
            <button
              key={page}
              className={`page-button ${currentPage === page ? 'active' : ''}`}
              onClick={() => handlePageChange(page)}
              aria-label={t('goToPage', { page })}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          ))}

          <button
            className="nav-button"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            aria-label={t('nextPage')}
          >
            {t('next')}
          </button>
        </nav>
      )}
    </div>
  );
}