import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import './BookingModal.css';

function BookingModal({ isOpen, onClose, car, onSubmit }) {
  const { t } = useLanguage();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  if (!isOpen || !car) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(startDate, endDate);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{t('bookCar')}: {car.brand} {car.model}</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('startDate')}:</label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label>{t('endDate')}:</label>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
          
          <div className="modal-buttons">
            <button type="submit" className="modal-button primary">
              {t('confirmBooking')}
            </button>
            <button type="button" onClick={onClose} className="modal-button">
              {t('cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BookingModal;