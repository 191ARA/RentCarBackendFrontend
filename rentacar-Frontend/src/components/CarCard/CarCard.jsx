import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import './CarCard.css';

function CarCard({ car, onClick }) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    return (
        <div className={`car-card ${theme}`} onClick={onClick}>
            <img 
                src={car.imageUrl || `http://localhost:8080/images/${car.id}.jpg`}
                alt={`${car.brand} ${car.model}`}
                className="car-image"
                onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                }}
            />
            
            <div className="car-info">
                <h3 className="car-title">
                    {car.brand} {car.model}
                </h3>


                <div className="car-details">
                    <p>
                        <span className="detail-label">{t('year')}:</span> 
                        {car.year || 'N/A'}
                    </p>
                    <p>
                        <span className="detail-label">{t('pricePerDay')}:</span> 
                        {car.pricePerDay ? `${car.pricePerDay} ₸` : 'N/A'}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default CarCard;