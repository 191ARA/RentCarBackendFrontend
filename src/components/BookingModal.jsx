import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import axios from 'axios';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import 'react-datepicker/dist/react-datepicker.css';
import './BookingModal.css';

export default function BookingModal({ isOpen, onClose, car, onSubmit }) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [bookedRanges, setBookedRanges] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availabilityError, setAvailabilityError] = useState('');
  const [diffDays, setDiffDays] = useState(0);

  // Функция форматирования даты в DD.MM.YYYY HH:mm
  const formatDate = (date) => {
    if (!date) return '--.--.---- --:--';
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}.${month}.${year} ${hours}:${minutes}`;
  };

  useEffect(() => {
    if (!isOpen) {
      setStartDate(null);
      setEndDate(null);
      setTotalPrice(0);
      setError('');
      setAvailabilityError('');
      setDiffDays(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (car?.id) {
      axios.get('http://localhost:8080/api/admin/bookings')
        .then(res => {
          const filtered = res.data
            .filter(b => b.car.id === car.id)
            .map(b => ({
              start: new Date(b.startDate),
              end: new Date(b.endDate)
            }));
          setBookedRanges(filtered);
        });
    }
  }, [car]);

  useEffect(() => {
    if (startDate && endDate && car?.pricePerDay) {
      const diffTime = endDate.getTime() - startDate.getTime();
      const days = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 1);
      setDiffDays(days);
      setTotalPrice(days * car.pricePerDay);
    } else {
      setDiffDays(0);
      setTotalPrice(0);
    }
  }, [startDate, endDate, car?.pricePerDay]);

  const isDateBlocked = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;

    return bookedRanges.some(range => 
      date >= new Date(range.start).setHours(0, 0, 0, 0) &&
      date <= new Date(range.end).setHours(0, 0, 0, 0)
    );
  };

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    let adjustedStart = null;
    let adjustedEnd = null;

    if (start) {
      adjustedStart = new Date(start);
      adjustedStart.setHours(12, 0, 0, 0);
    }

    if (end) {
      adjustedEnd = new Date(end);
      adjustedEnd.setDate(adjustedEnd.getDate() + 1);
      adjustedEnd.setHours(12, 0, 0, 0);
    }

    setStartDate(adjustedStart);
    setEndDate(adjustedEnd);
    setError('');
    setAvailabilityError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!startDate || !endDate) {
      setError(t('selectBothDates'));
      return;
    }

    if (startDate > endDate) {
      setError(t('invalidDateRange'));
      return;
    }

    setError('');
    setAvailabilityError('');
    setLoading(true);

    try {
      await onSubmit(startDate.getTime(), endDate.getTime());
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || t('bookingError'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !car) return null;

  return (
    <div className={`modal-overlay ${theme}`}>
      <div className={`booking-modal ${theme}`}>
        <button 
          className="close-button" 
          onClick={onClose} 
          aria-label={t('close')}
        >
          &times;
        </button>

        <h3 className="modal-title">
          {t('booking')} <span className="car-name">{car.brand} {car.model}</span>
        </h3>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group calendar-container">
            <label className="date-range-label">{t('selectDates')}:</label>
            <DatePicker
              selected={startDate}
              onChange={handleDateChange}
              startDate={startDate}
              endDate={endDate}
              selectsRange
              inline
              minDate={new Date()}
              filterDate={(date) => !isDateBlocked(date)}
              dayClassName={(date) => {
                if (isDateBlocked(date)) return 'booked-day';
                if (date.getTime() === startDate?.getTime()) return 'selected-start-day';
                if (date.getTime() === endDate?.getTime()) return 'selected-end-day';
                if (startDate && endDate && date > startDate && date < endDate) return 'in-range-day';
                return null;
              }}
            />
          </div>

          <div className="selected-dates">
            <div className="date-box">
              <span className="date-label">{t('startDate')}:</span>
              <span className="date-value">
                {formatDate(startDate)}
              </span>
            </div>
            <div className="date-box">
              <span className="date-label">{t('endDate')}:</span>
              <span className="date-value">
                {formatDate(endDate)}
              </span>
            </div>
          </div>

          {totalPrice > 0 && (
            <div className="price-summary">
              <div className="price-row">
                <span>{t('totalPrice')}:</span>
                <span className="price-amount">{totalPrice.toLocaleString()} ₸</span>
              </div>
              <div className="price-details">
                {car.pricePerDay.toLocaleString()} ₸ × {diffDays} {t('days')}
              </div>
            </div>
          )}

          {(error || availabilityError) && (
            <div className="error-message">
              {error || availabilityError}
            </div>
          )}

          <div className="modal-actions">
            <button 
              type="button" 
              className="cancel-button" 
              onClick={onClose} 
              disabled={loading}
            >
              {t('cancel')}
            </button>
            <button 
              type="submit" 
              className="submit-button" 
              disabled={loading || !startDate || !endDate}
            >
              {loading ? t('processing') : t('confirmBooking')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}