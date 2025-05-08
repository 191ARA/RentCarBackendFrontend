import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { getCars } from '../../api/cars';
import CarCard from '../../components/CarCard';
import BookingModal from '../../components/BookingModal';
import './CarsPage.css';

function CarsPrivatePage() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCar, setSelectedCar] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  
  // Состояния для фильтрации и сортировки
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [sortBy, setSortBy] = useState('brand');
  const [sortOrder, setSortOrder] = useState('asc');
  
  const carsPerPage = 6;
  const uniqueBrands = [...new Set(cars.map(car => car.brand))].sort();

  const [user] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const data = await getCars();
        setCars(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  // Фильтрация и сортировка
  const filteredAndSortedCars = [...cars]
    .filter(car => selectedBrand === 'all' || car.brand === selectedBrand)
    .sort((a, b) => {
      if (sortBy === 'brand') {
        const compare = a.brand.localeCompare(b.brand);
        return sortOrder === 'asc' ? compare : -compare;
      }
      if (sortBy === 'year') {
        return sortOrder === 'asc' ? a.year - b.year : b.year - a.year;
      }
      if (sortBy === 'price') {
        return sortOrder === 'asc' 
          ? a.pricePerDay - b.pricePerDay 
          : b.pricePerDay - a.pricePerDay;
      }
      return 0;
    });

  // Пагинация
  const indexOfLastCar = currentPage * carsPerPage;
  const indexOfFirstCar = indexOfLastCar - carsPerPage;
  const currentCars = filteredAndSortedCars.slice(indexOfFirstCar, indexOfLastCar);
  const totalPages = Math.ceil(filteredAndSortedCars.length / carsPerPage);

  const handleBookingSubmit = async (startDate, endDate) => {
    try {
      const response = await fetch('http://localhost:8080/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token || ''}`
        },
        body: JSON.stringify({
          carId: selectedCar.id,
          userId: user?.id,
          startDate,
          endDate
        })
      });

      if (!response.ok) throw new Error(await response.text());
      
      setShowBookingModal(false);
      alert(t('bookingSuccess'));
    } catch (error) {
      alert(error.message);
    }
  };

  // Функции пагинации
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => currentPage < totalPages && setCurrentPage(p => p + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage(p => p - 1);
  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);

  const getPageRange = () => {
    const range = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = startPage + maxVisiblePages - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) range.push(i);
    return range;
  };

  if (loading) return <div className="loading">{t('loading')}</div>;
  if (error) return <div className="error">{t('error')}: {error}</div>;

  return (
    <div className={`cars-page ${theme}`}>
      <h1>{t('availableCars')}</h1>
      <p className="welcome-message">{t('welcomeUser')}, {user?.name || user?.email}!</p>

      {/* Панель фильтров и сортировки */}
      <div className="controls-container">
        <div className="filter-group">
          <label>{t('filterByBrand')}:</label>
          <select
            value={selectedBrand}
            onChange={(e) => {
              setSelectedBrand(e.target.value);
              setCurrentPage(1);
            }}
            className="brand-select"
          >
            <option value="all">{t('allBrands')}</option>
            {uniqueBrands.map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>{t('sortBy')}:</label>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            className="sort-select"
          >
            <option value="brand">{t('brand')}</option>
            <option value="year">{t('year')}</option>
            <option value="price">{t('price')}</option>
          </select>
          <button
            onClick={() => {
              setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
              setCurrentPage(1);
            }}
            className="sort-order"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Список автомобилей */}
      <div className="car-list">
        {currentCars.map(car => (
          <CarCard 
            key={car.id} 
            car={car} 
            onClick={() => {
              setSelectedCar(car);
              setShowBookingModal(true);
            }} 
          />
        ))}
      </div>

      {/* Пагинация */}
      {filteredAndSortedCars.length > carsPerPage && (
        <div className="pagination">
          <button 
            onClick={goToFirstPage} 
            disabled={currentPage === 1}
            className="nav-button"
          >
            &laquo;
          </button>
          <button 
            onClick={prevPage} 
            disabled={currentPage === 1}
            className="nav-button"
          >
            &lsaquo;
          </button>
          
          {getPageRange().map(number => (
            <button
              key={number}
              onClick={() => paginate(number)}
              className={`page-button ${currentPage === number ? 'active' : ''}`}
            >
              {number}
            </button>
          ))}
          
          <button 
            onClick={nextPage} 
            disabled={currentPage === totalPages}
            className="nav-button"
          >
            &rsaquo;
          </button>
          <button 
            onClick={goToLastPage} 
            disabled={currentPage === totalPages}
            className="nav-button"
          >
            &raquo;
          </button>
        </div>
      )}

      {/* Модальное окно бронирования */}
      {showBookingModal && (
        <BookingModal 
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          car={selectedCar}
          onSubmit={handleBookingSubmit}
        />
      )}
    </div>
  );
}

export default CarsPrivatePage;