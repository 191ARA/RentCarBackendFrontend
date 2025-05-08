import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import './PaymentPage.css';

function PaymentPage({ user }) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchPayments = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/payments/user/${user.id}`);
        setPayments(response.data);
      } catch (err) {
        setError(err.response?.data?.message || t('paymentFetchError'));
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [user, navigate, t]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatCurrency = (amount) => {
    return amount?.toLocaleString('ru-RU') + ' ₸';
  };

  if (loading) {
    return <div className={`loading ${theme}`}>{t('loading')}</div>;
  }

  if (error) {
    return <div className={`error ${theme}`}>{error}</div>;
  }

  return (
    <div className={`payments-container ${theme}`}>
      <h1>{t('paymentHistory')}</h1>
      
      {payments.length === 0 ? (
        <div className="no-payments">
          <p>{t('noPayments')}</p>
        </div>
      ) : (
        <div className="payments-list">
          {payments.map(payment => (
            <div key={payment.id} className={`payment-card ${theme}`}>
              <div className="payment-header">
                <h3>{t('payment')} #{payment.id}</h3>
                <span className={`status-badge ${payment.status}`}>
                  {t(payment.status)}
                </span>
              </div>
              
              <div className="payment-details">
                <div className="detail-row">
                  <span>{t('booking')}:</span>
                  <span>{payment.booking.car.brand} {payment.booking.car.model}</span>
                </div>
                
                <div className="detail-row">
                  <span>{t('amount')}:</span>
                  <span className="amount">{formatCurrency(payment.amount)}</span>
                </div>
                
                <div className="detail-row">
                  <span>{t('paymentDate')}:</span>
                  <span>{formatDate(payment.paymentDate)}</span>
                </div>
                
                <div className="detail-row">
                  <span>{t('paymentMethod')}:</span>
                  <span>{payment.paymentMethod}</span>
                </div>
                
                <div className="detail-row">
                  <span>{t('transactionId')}:</span>
                  <span>{payment.transactionId}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PaymentPage;