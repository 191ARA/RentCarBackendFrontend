import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import './PaymentForm.css';

const PaymentForm = ({ bookingId, amount, onSuccess, onClose }) => {
  const { theme } = useTheme();
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);

    try {
      // Простая валидация на фронтенде
      if (!cardNumber || cardNumber.replace(/\s/g, '').length !== 16) {
        throw new Error('Введите 16-значный номер карты');
      }
      
      if (!expiryDate || !expiryDate.match(/^\d{2}\/\d{2}$/)) {
        throw new Error('Введите срок действия в формате ММ/ГГ');
      }
      
      if (!cvv || cvv.length !== 3) {
        throw new Error('Введите 3-значный CVV код');
      }

      const paymentData = {
        bookingId,
        amount,
        cardNumber: cardNumber.replace(/\s/g, ''),
        cardHolder,
        expiryDate,
        cvv
      };

      const response = await fetch('http://localhost:8080/api/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const handleCardNumberChange = (e) => {
    setCardNumber(formatCardNumber(e.target.value));
  };

  return (
    <div className={`payment-form-container ${theme}`}>
      <h3>Оплата залога: {amount} ₸</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Номер карты</label>
          <input
            type="text"
            value={cardNumber}
            onChange={handleCardNumberChange}
            placeholder="1234 5678 9012 3456"
            maxLength="19"
          />
        </div>
        
        <div className="form-group">
          <label>Имя владельца</label>
          <input
            type="text"
            value={cardHolder}
            onChange={(e) => setCardHolder(e.target.value)}
            placeholder="IVAN IVANOV"
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Срок действия</label>
            <input
              type="text"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              placeholder="ММ/ГГ"
              maxLength="5"
            />
          </div>
          
          <div className="form-group">
            <label>CVV</label>
            <input
              type="text"
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="123"
              maxLength="3"
            />
          </div>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-actions">
          <button type="button" onClick={onClose} className="cancel-btn">
            Отмена
          </button>
          <button type="submit" disabled={processing} className="submit-btn">
            {processing ? 'Обработка...' : `Оплатить ${amount} ₸`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;