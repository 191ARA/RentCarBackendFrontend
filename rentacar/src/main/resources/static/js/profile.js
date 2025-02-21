    document.addEventListener('DOMContentLoaded', () => {
        const userId = localStorage.getItem('authToken');

        if (!userId) {
            window.location.href = 'login.html';
            return;
        }

        // Загрузка данных пользователя
        fetch(`/api/users/${userId}`)
            .then(response => response.json())
            .then(user => {
                document.getElementById('user-name').textContent = user.name;
                document.getElementById('user-email').textContent = user.email;
            })
            .catch(error => {
                console.error('Ошибка при загрузке данных пользователя:', error);
            });

        // Загрузка бронирований пользователя
        fetch(`/api/bookings?userId=${userId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const bookingsList = document.getElementById('bookings-list');
                    const modalBookingsList = document.getElementById('modal-bookings-list');
                    data.bookings.forEach(booking => {
                        const startDate = new Date(booking.startDate).toLocaleDateString();
                        const endDate = new Date(booking.endDate).toLocaleDateString();

                        // Карточка бронирования для основного списка
                        const bookingDiv = document.createElement('div');
                        bookingDiv.className = 'booking-card booked';
                        bookingDiv.innerHTML = `
                            <div class="booking-info">
                                <h3>${booking.car.brand} ${booking.car.model}</h3>
                                <p>Дата начала: ${startDate}</p>
                                <p>Дата окончания: ${endDate}</p>
                                <p>Цена: ${booking.totalPrice} тг.</p>
                            </div>
                            <img src="images/${booking.car.id}.jpg" alt="${booking.car.brand} ${booking.car.model}" class="booking-car-image">
                        `;
                        bookingsList.appendChild(bookingDiv);

                        // Карточка бронирования для модального окна
                        const modalBookingDiv = document.createElement('div');
                        modalBookingDiv.className = 'booking-card booked';
                        modalBookingDiv.innerHTML = `
                            <div class="booking-info">
                                <h3>${booking.car.brand} ${booking.car.model}</h3>
                                <p>Дата начала: ${startDate}</p>
                                <p>Дата окончания: ${endDate}</p>
                                <p>Цена: ${booking.totalPrice} тг.</p>
                            </div>
                            <img src="images/${booking.car.id}.jpg" alt="${booking.car.brand} ${booking.car.model}" class="booking-car-image">
                        `;
                        modalBookingsList.appendChild(modalBookingDiv);
                    });
                } else {
                    alert(data.message);
                }
            });

        // Загрузка доступных автомобилей
        fetch('/api/cars')
            .then(response => response.json())
            .then(cars => {
                const carsList = document.getElementById('cars-list');
                cars.forEach(car => {
                    const carDiv = document.createElement('div');
                    carDiv.className = 'car-card';
                    carDiv.innerHTML = `
                        <img src="images/${car.id}.jpg" alt="${car.brand} ${car.model}">
                        <h3>${car.brand} ${car.model}</h3>
                        <p>Год выпуска: ${car.year}</p>
                        <p>Цена за день: ${car.pricePerDay} тг.</p>
                        <button onclick="openBookingModal(${car.id}, ${car.pricePerDay})">Забронировать</button>
                    `;
                    carsList.appendChild(carDiv);
                });
            });
    });

    function openBookingModal(carId, pricePerDay) {
        document.getElementById('bookingModal').style.display = 'block';

        const bookingForm = document.getElementById('bookingForm');
        bookingForm.onsubmit = function(event) {
            event.preventDefault();

            const startDate = document.getElementById('startDate').value;
            const endDate = document.getElementById('endDate').value;

            if (!startDate || !endDate) {
                alert('Пожалуйста, введите обе даты.');
                return;
            }

            const userId = localStorage.getItem('authToken');
            fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: userId,
                    carId: carId,
                    startDate: new Date(startDate).getTime(),
                    endDate: new Date(endDate).getTime()
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Автомобиль успешно забронирован!');
                    window.location.reload();
                } else {
                    alert('Ошибка: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Ошибка:', error);
            });
        };
    }

    function closeBookingModal() {
        document.getElementById('bookingModal').style.display = 'none';
    }

    function logout() {
        localStorage.removeItem('authToken');
        window.location.href = 'index.html';
    }

    function openModal() {
        document.getElementById('profileModal').style.display = 'block';
    }

    function closeModal() {
        document.getElementById('profileModal').style.display = 'none';
    }

    window.onclick = function(event) {
        const modal = document.getElementById('profileModal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    }




        function loadAllCars() {
        fetch('/api/cars')
            .then(response => response.json())
            .then(cars => {
                const carsList = document.getElementById('cars-list');
                carsList.innerHTML = '';
                cars.forEach(car => {
                    const carDiv = document.createElement('div');
                    carDiv.className = 'car-card';
                    carDiv.innerHTML = `
                        <img src="/images/${car.id}.jpg" alt="${car.brand} ${car.model}">
                        <h3>${car.brand} ${car.model}</h3>
                        <p>Год выпуска: ${car.year}</p>
                        <p>Цена за день: ${car.pricePerDay} тг.</p>
                        <button onclick="openBookingModal(${car.id}, ${car.pricePerDay})">Забронировать</button>
                    `;
                    carsList.appendChild(carDiv);
                });
            })
            .catch(error => console.error('Ошибка:', error));
    }

    document.getElementById('search-form').addEventListener('submit', function(event) {
        event.preventDefault();
        const brand = document.getElementById('car-brand').value;
        const sortOption = document.getElementById('sort').value;

        fetch('/api/cars')
            .then(response => response.json())
            .then(cars => {
                let filteredCars = cars;
                if (brand !== 'all') {
                    filteredCars = filteredCars.filter(car => car.brand === brand);
                }

                if (sortOption === 'price-asc') {
                    filteredCars.sort((a, b) => a.pricePerDay - b.pricePerDay);
                } else if (sortOption === 'price-desc') {
                    filteredCars.sort((a, b) => b.pricePerDay - a.pricePerDay);
                } else if (sortOption === 'year-new') {
                    filteredCars.sort((a, b) => b.year - a.year);
                } else if (sortOption === 'year-old') {
                    filteredCars.sort((a, b) => a.year - b.year);
                }

                const carsList = document.getElementById('cars-list');
                carsList.innerHTML = '';
                filteredCars.forEach(car => {
                    const carDiv = document.createElement('div');
                    carDiv.className = 'car-card';
                    carDiv.innerHTML = `
                        <img src="/images/${car.id}.jpg" alt="${car.brand} ${car.model}">
                        <h3>${car.brand} ${car.model}</h3>
                        <p>Год выпуска: ${car.year}</p>
                        <p>Цена за день: ${car.pricePerDay} тг.</p>
                        <button onclick="openBookingModal(${car.id}, ${car.pricePerDay})">Забронировать</button>
                    `;
                    carsList.appendChild(carDiv);
                });
            })
            .catch(error => console.error('Ошибка:', error));
    });

    document.getElementById('reset-button').addEventListener('click', function() {
        document.getElementById('search-form').reset();
        loadAllCars();
    });

    window.addEventListener('load', loadAllCars);