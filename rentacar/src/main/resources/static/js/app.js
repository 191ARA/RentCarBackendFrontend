


document.addEventListener('DOMContentLoaded', () => {
    // Обработка отправки формы регистрации
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function (event) {
            event.preventDefault();

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            console.log('Отправляемые данные:', { name, email, password }); // Логирование

            fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Ошибка сети');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Ответ от сервера:', data); // Логирование
                    if (data.success) {
                        alert('Регистрация выполнена успешно!');
                        window.location.href = 'login.html';
                    } else {
                        alert('Ошибка: ' + data.message);
                    }
                })
                .catch(error => {
                    console.error('Ошибка:', error);
                    alert('Произошла ошибка при регистрации.');
                });
        });
    }

    // Загрузка списка автомобилей
    fetch('/api/cars')
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка при загрузке автомобилей');
            }
            return response.json();
        })
        .then(cars => {
            const carsList = document.getElementById('cars-list');
            cars.forEach(car => {
                const carDiv = document.createElement('div');
                carDiv.className = 'car-card';
                carDiv.innerHTML = `
                    <img src="/images/${car.id}.jpg" alt="${car.brand} ${car.model}">
                    <h3>${car.brand} ${car.model}</h3>
                    <p>Год выпуска: ${car.year}</p>
                    <p>Цена за день: ${car.pricePerDay} тг.</p>
                `;
                carsList.appendChild(carDiv);
            });
        })
        .catch(error => {
            console.error('Ошибка:', error);
            alert('Произошла ошибка при загрузке автомобилей.');
        });
});

document.querySelectorAll('.adv-item').forEach(item => {
    item.addEventListener('click', function () {
        const description = document.getElementById('adv-description');
        description.textContent = this.dataset.info;
        description.style.opacity = 1;
    });
});


document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault(); // Предотвращаем стандартное поведение ссылки

        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 70,
                behavior: 'smooth'
            });
        }
    });
});

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