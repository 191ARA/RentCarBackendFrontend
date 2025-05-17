import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import PaymentForm from '../../components/PaymentForm/PaymentForm';
import './BookingsPage.css';

function BookingsPage({ user }) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchBookings = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/admin/bookings`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch bookings');
        }
        
        const data = await response.json();
        const userBookings = data.filter(booking => 
          booking.user && booking.user.id === user.id
        );
        
        setBookings(userBookings);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, navigate, paymentSuccess]);

  const handleCancelBooking = async (bookingId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/bookings/cancel/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cancel booking');
      }

      setBookings(bookings.filter(booking => booking.id !== bookingId));
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePayDepositClick = (booking) => {
    setSelectedBooking(booking);
    setShowPaymentForm(true);
  };

  const handlePaymentSuccess = () => {
    setPaymentSuccess(!paymentSuccess);
    setShowPaymentForm(false);
    setSelectedBooking(null);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return <div className={`loading ${theme}`}>{t('loading')}</div>;
  }

  if (error) {
    return <div className={`error ${theme}`}>{error}</div>;
  }

  return (
    <div className={`bookings-container ${theme}`}>
      <h1>{t('myBookings')}</h1>
      
      {bookings.length === 0 ? (
        <div className="no-bookings">
          <p>{t('noBookings')}</p>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map(booking => (
            <div key={booking.id} className={`booking-card ${theme}`}>
              <div className="car-image-container">
                <img 
                  src={booking.car.imageUrl || `http://localhost:8080/images/${booking.car.id}.jpg`}
                  alt={`${booking.car.brand} ${booking.car.model}`}
                  className="car-image"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                  }}
                />
              </div>
              
              <div className="booking-info">
                <h2>{booking.car.brand} {booking.car.model}</h2>
                <p><strong>{t('year')}:</strong> {booking.car.year}</p>
                <p><strong>{t('pricePerDay')}:</strong> {booking.car.pricePerDay} ₸</p>
                <p><strong>{t('bookingPeriod')}:</strong> {formatDate(booking.startDate)} - {formatDate(booking.endDate)}</p>
                <p><strong>{t('totalPrice')}:</strong> {booking.totalPrice} ₸</p>
                <p><strong>{t('deposit')}:</strong> 
                  {booking.depositPaid ? (
                    <span className="deposit-paid">{t('paid')} (50,000 ₸)</span>
                  ) : (
                    <span className="deposit-not-paid">{t('notPaid')} (50,000 ₸)</span>
                  )}
                </p>
              </div>
              
              <div className="booking-actions">
                {!booking.depositPaid && (
                  <button 
                    onClick={() => handlePayDepositClick(booking)}
                    className="pay-deposit-btn"
                  >
                    {t('payDeposit')}
                  </button>
                )}
                
                <button 
                  onClick={() => handleCancelBooking(booking.id)}
                  className="cancel-btn"
                >
                  {t('cancelBooking')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showPaymentForm && selectedBooking && (
        <div className="payment-modal">
          <div className="payment-modal-content">
            <PaymentForm
              bookingId={selectedBooking.id}
              amount={selectedBooking.depositAmount || 50000}
              onSuccess={handlePaymentSuccess}
              onClose={() => setShowPaymentForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default BookingsPage;