import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminPage.css';
import { useTheme } from '../../contexts/ThemeContext';

function AdminPage() {
  const { theme } = useTheme();
  const [users, setUsers] = useState([]);
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('users');
  
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, carsRes, bookingsRes] = await Promise.all([
        axios.get('http://localhost:8080/api/admin/users'),
        axios.get('http://localhost:8080/api/admin/cars'),
        axios.get('http://localhost:8080/api/admin/bookings'),
      ]);
      
      setUsers(usersRes.data);
      setCars(carsRes.data);
      setBookings(bookingsRes.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedItems = (items) => {
    if (!sortConfig.key) return items;
    
    return [...items].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const getFilteredItems = (items, fields) => {
    if (!searchTerm) return items;
    
    return items.filter(item => 
      fields.some(field => {
        const value = field.includes('.') 
          ? field.split('.').reduce((obj, key) => obj?.[key], item)
          : item[field];
        return String(value || '').toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreate = async () => {
    try {
      let endpoint = '';
      let data = formData;
      
      if (activeTab === 'users') {
        endpoint = 'http://localhost:8080/api/admin/users';
      } else if (activeTab === 'cars') {
        endpoint = 'http://localhost:8080/api/admin/cars';
        data = { ...data, available: data.available === 'true' };
      } else if (activeTab === 'bookings') {
        endpoint = 'http://localhost:8080/api/admin/bookings';
        data = { 
          ...data, 
          startDate: new Date(data.startDate).toISOString(),
          endDate: new Date(data.endDate).toISOString()
        };
      }
      
      await axios.post(endpoint, data);
      fetchData();
      setIsCreating(false);
      setFormData({});
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleUpdate = async () => {
    try {
      let endpoint = '';
      let data = formData;
      
      if (activeTab === 'users') {
        endpoint = `http://localhost:8080/api/admin/users/${editingId}`;
        // Удаляем пароль из данных, если он случайно попал в форму
        delete data.password;
      } else if (activeTab === 'cars') {
        endpoint = `http://localhost:8080/api/admin/cars/${editingId}`;
        data = { ...data, available: data.available === 'true' };
      } else if (activeTab === 'bookings') {
        endpoint = `http://localhost:8080/api/admin/bookings/${editingId}`;
        data = { 
          ...data, 
          startDate: new Date(data.startDate).toISOString(),
          endDate: new Date(data.endDate).toISOString()
        };
      }
      
      await axios.put(endpoint, data);
      fetchData();
      setEditingId(null);
      setFormData({});
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      if (window.confirm('Вы уверены, что хотите удалить этот элемент?')) {
        if (activeTab === 'users') {
          await axios.delete(`http://localhost:8080/api/admin/users/${id}`);
        } else if (activeTab === 'cars') {
          await axios.delete(`http://localhost:8080/api/admin/cars/${id}`);
        } else if (activeTab === 'bookings') {
          await axios.delete(`http://localhost:8080/api/admin/bookings/${id}`);
        }
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const startEditing = (item) => {
    setEditingId(item.id);
    // Копируем только нужные поля, исключая пароль
    const { password, ...safeData } = item;
    setFormData(safeData);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setIsCreating(false);
    setFormData({});
  };

  const getSearchFields = () => {
    switch (activeTab) {
      case 'users':
        return ['id', 'name', 'email', 'role'];
      case 'cars':
        return ['id', 'brand', 'model', 'year', 'pricePerDay'];
      case 'bookings':
        return [
          'id', 
          'user.id', 
          'car.id', 
          'user.name', 
          'car.brand', 
          'car.model', 
          'totalPrice', 
          'depositPaid', 
          'depositAmount',
          'active'];
      default:
        return [];
    }
  };

  const getProcessedData = () => {
    let data = [];
    switch (activeTab) {
      case 'users':
        data = users;
        break;
      case 'cars':
        data = cars;
        break;
      case 'bookings':
        data = bookings;
        break;
      default:
        data = [];
    }
    
    const filtered = getFilteredItems(data, getSearchFields());
    return getSortedItems(filtered);
  };

  const renderForm = () => {
    if (activeTab === 'users') {
      return (
        <div className={`edit-form ${theme}`}>
          <h3>{isCreating ? 'Создать пользователя' : 'Редактировать пользователя'}</h3>
          <div className="form-group">
            <label>Имя:</label>
            <input
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Роль:</label>
            <select
              name="role"
              value={formData.role || 'user'}
              onChange={handleInputChange}
            >
              <option value="user">Пользователь</option>
              <option value="admin">Администратор</option>
            </select>
          </div>
          <div className="form-actions">
            <button 
              className="save-btn"
              onClick={isCreating ? handleCreate : handleUpdate}
            >
              {isCreating ? 'Создать' : 'Сохранить'}
            </button>
            <button 
              className="cancel-btn"
              onClick={cancelEditing}
            >
              Отмена
            </button>
          </div>
        </div>
      );
    } else if (activeTab === 'cars') {
      return (
        <div className={`edit-form ${theme}`}>
          <h3>{isCreating ? 'Добавить автомобиль' : 'Редактировать автомобиль'}</h3>
          <div className="form-group">
            <label>Марка:</label>
            <input
              type="text"
              name="brand"
              value={formData.brand || ''}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Модель:</label>
            <input
              type="text"
              name="model"
              value={formData.model || ''}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Год:</label>
            <input
              type="number"
              name="year"
              value={formData.year || ''}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Цена за день:</label>
            <input
              type="number"
              name="pricePerDay"
              value={formData.pricePerDay || ''}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Доступность:</label>
            <select
              name="available"
              value={formData.available || 'true'}
              onChange={handleInputChange}
            >
              <option value="true">Доступен</option>
              <option value="false">Не доступен</option>
            </select>
          </div>
          <div className="form-actions">
            <button 
              className="save-btn"
              onClick={isCreating ? handleCreate : handleUpdate}
            >
              {isCreating ? 'Создать' : 'Сохранить'}
            </button>
            <button 
              className="cancel-btn"
              onClick={cancelEditing}
            >
              Отмена
            </button>
          </div>
        </div>
      );
    } else if (activeTab === 'bookings') {
      return (
        <table className={theme}>
          <thead>
            <tr>
              <th onClick={() => requestSort('id')}>ID {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
              <th>Пользователь</th>
              <th>Автомобиль</th>
              <th onClick={() => requestSort('startDate')}>Дата начала {sortConfig.key === 'startDate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
              <th onClick={() => requestSort('endDate')}>Дата окончания {sortConfig.key === 'endDate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
              <th onClick={() => requestSort('totalPrice')}>Стоимость {sortConfig.key === 'totalPrice' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
              <th onClick={() => requestSort('depositPaid')}>Залог {sortConfig.key === 'depositPaid' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
              <th onClick={() => requestSort('active')}>Статус {sortConfig.key === 'active' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {processedData.map(booking => (
              <tr key={booking.id}>
                <td>{booking.id}</td>
                <td>{booking.user?.name || 'N/A'}</td>
                <td>{booking.car?.brand || 'N/A'} {booking.car?.model || 'N/A'}</td>
                <td>{new Date(booking.startDate).toLocaleDateString()}</td>
                <td>{new Date(booking.endDate).toLocaleDateString()}</td>
                <td>{booking.totalPrice} ₸</td>
                <td className={booking.depositPaid ? 'paid' : 'not-paid'}>
                  {booking.depositPaid ? 'Оплачен' : 'Не оплачен'}
                </td>
                <td>{booking.depositAmount.toLocaleString()} ₸</td>

                <td className={booking.depositPaid ? 'paid' : 'not-paid'}>
                  {booking.depositPaid ? 'Оплачен' : 'Не оплачен'}
                </td>
                <td className={booking.active ? 'active' : 'cancelled'}>
                  {booking.active ? 'Активно' : 'Отменено'}
                </td>
                <td className="actions">
                  <button 
                    className="edit-btn"
                    onClick={() => startEditing(booking)}
                  >
                    Редактировать
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(booking.id)}
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    return null;
  };

  const renderTable = () => {
    const processedData = getProcessedData();
    
    if (activeTab === 'users') {
      return (
        <table className={theme}>
          <thead>
            <tr>
              <th onClick={() => requestSort('id')}>ID {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
              <th onClick={() => requestSort('name')}>Имя {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
              <th onClick={() => requestSort('email')}>Email {sortConfig.key === 'email' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
              <th onClick={() => requestSort('role')}>Роль {sortConfig.key === 'role' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {processedData.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td className="actions">
                  <button 
                    className="edit-btn"
                    onClick={() => startEditing(user)}
                  >
                    Редактировать
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(user.id)}
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    } else if (activeTab === 'cars') {
      return (
        <table className={theme}>
          <thead>
            <tr>
              <th onClick={() => requestSort('id')}>ID {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
              <th onClick={() => requestSort('brand')}>Марка {sortConfig.key === 'brand' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
              <th onClick={() => requestSort('model')}>Модель {sortConfig.key === 'model' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
              <th onClick={() => requestSort('year')}>Год {sortConfig.key === 'year' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
              <th onClick={() => requestSort('pricePerDay')}>Цена/день {sortConfig.key === 'pricePerDay' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
              <th onClick={() => requestSort('available')}>Доступность {sortConfig.key === 'available' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {processedData.map(car => (
              <tr key={car.id}>
                <td>{car.id}</td>
                <td>{car.brand}</td>
                <td>{car.model}</td>
                <td>{car.year}</td>
                <td>{car.pricePerDay} ₸</td>
                <td>{car.available ? 'Да' : 'Нет'}</td>
                <td className="actions">
                  <button 
                    className="edit-btn"
                    onClick={() => startEditing(car)}
                  >
                    Редактировать
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(car.id)}
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    } else if (activeTab === 'bookings') {
      // В функции renderTable для раздела bookings
      return (
        <table className={theme}>
          <thead>
            <tr>
              <th onClick={() => requestSort('id')}>ID {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
              <th onClick={() => requestSort('user_id')}>User ID {sortConfig.key === 'user_id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
              <th onClick={() => requestSort('car_id')}>Car ID {sortConfig.key === 'car_id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
              <th>Пользователь</th>
              <th>Автомобиль</th>
              <th onClick={() => requestSort('startDate')}>Дата начала {sortConfig.key === 'startDate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
              <th onClick={() => requestSort('endDate')}>Дата окончания {sortConfig.key === 'endDate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
              <th onClick={() => requestSort('totalPrice')}>Стоимость {sortConfig.key === 'totalPrice' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
              <th onClick={() => requestSort('depositPaid')}>Залог {sortConfig.key === 'depositPaid' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
              <th onClick={() => requestSort('depositAmount')}>Сумма залога {sortConfig.key === 'depositAmount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
              <th onClick={() => requestSort('active')}>Статус {sortConfig.key === 'active' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {processedData.map(booking => (
              <tr key={booking.id}>
                <td>{booking.id}</td>
                <td>{booking.user?.id || 'N/A'}</td>
                <td>{booking.car?.id || 'N/A'}</td>
                <td>{booking.user?.name || 'N/A'}</td>
                <td>{booking.car?.brand || 'N/A'} {booking.car?.model || 'N/A'}</td>
                <td>{new Date(booking.startDate).toLocaleDateString()}</td>
                <td>{new Date(booking.endDate).toLocaleDateString()}</td>
                <td>{booking.totalPrice.toLocaleString()} ₸</td>
                <td className={booking.depositPaid ? 'paid' : 'not-paid'}>
                  {booking.depositPaid ? 'Оплачен' : 'Не оплачен'}
                </td>
                <td>{booking.depositAmount.toLocaleString()} ₸</td>
                <td className={booking.active ? 'active' : 'cancelled'}>
                  {booking.active ? 'Активно' : 'Отменено'}
                </td>
                <td className="actions">
                  <button 
                    className="edit-btn"
                    onClick={() => startEditing(booking)}
                  >
                    Редактировать
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(booking.id)}
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    return null;
  };

  if (loading) return <div className={`loading ${theme}`}>Загрузка...</div>;
  if (error) return <div className={`error ${theme}`}>Ошибка: {error}</div>;

  return (
    <div className={`admin-page ${theme}`}>
      <h1>Админ-панель</h1>
      
      <div className="admin-tabs">
        <button 
          onClick={() => {
            setActiveTab('users');
            cancelEditing();
          }} 
          className={activeTab === 'users' ? 'active' : ''}
        >
          Пользователи
        </button>
        <button 
          onClick={() => {
            setActiveTab('cars');
            cancelEditing();
          }} 
          className={activeTab === 'cars' ? 'active' : ''}
        >
          Автомобили
        </button>
        <button 
          onClick={() => {
            setActiveTab('bookings');
            cancelEditing();
          }} 
          className={activeTab === 'bookings' ? 'active' : ''}
        >
          Бронирования
        </button>
      </div>

      <div className="admin-controls">
        <div className={`search-box ${theme}`}>
          <input
            type="text"
            placeholder="Поиск..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          className={`create-button ${theme}`}
          onClick={() => {
            setIsCreating(true);
            setEditingId(null);
            setFormData({});
          }}
        >
          Создать новый
        </button>
      </div>

      <div className="admin-section">
        {(isCreating || editingId) && renderForm()}
        <h2>
          {activeTab === 'users' && 'Пользователи'}
          {activeTab === 'cars' && 'Автомобили'}
          {activeTab === 'bookings' && 'Бронирования'}
        </h2>
        {renderTable()}
      </div>
    </div>
  );
}

export default AdminPage;


