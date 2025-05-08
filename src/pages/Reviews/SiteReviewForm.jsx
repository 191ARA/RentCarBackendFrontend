import { useState } from 'react';
import axios from 'axios';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import './SiteReviewForm.css';

export default function SiteReviewForm({ user, onReviewAdded }) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user?.id) {
      setMessage({
        text: t('authRequired'),
        type: 'error'
      });
      return;
    }

    if (rating < 1 || rating > 5) {
      setMessage({
        text: t('ratingValidation'),
        type: 'error'
      });
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:8080/api/site-reviews',
        { rating, comment },
        { headers: { Authorization: user.id.toString() } }
      );

      if (response.data.success) {
        setMessage({ text: t('reviewThanks'), type: 'success' });
        setRating(0);
        setComment('');
        onReviewAdded();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || t('unknownError');
      setMessage({ text: `${t('submitError')}: ${errorMessage}`, type: 'error' });
    }
  };

  return (
    <div className={`review-form ${theme}`}>
      <form onSubmit={handleSubmit}>
        <div className="rating-container">
          <label htmlFor="rating-stars">{t('yourRating')}:</label>
          <div className="star-rating" id="rating-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                className={`star ${star <= rating ? 'active' : ''}`}
                onClick={() => setRating(star)}
                aria-label={t('ratingLabel', { stars: star })}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="comment">
            {t('comment')}:
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('commentPlaceholder')}
              rows="4"
              maxLength="500"
            />
          </label>
          <small>{t('maxSymbols', { count: 500 })}</small>
        </div>

        <button 
          type="submit" 
          className="submit-btn"
          disabled={!user?.id}
        >
          {t('submitReview')}
        </button>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
} 