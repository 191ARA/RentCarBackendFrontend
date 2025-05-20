import { Link } from 'react-router-dom';
import './NotFoundPage.css'; 

function NotFoundPage() {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1>404</h1>
        <h2>Страница не найдена</h2>
        <p>Запрашиваемая страница не существует или была перемещена.</p>
        <Link to="/" className="home-link">
          Вернуться на главную
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;