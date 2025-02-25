let currentEditingId = null;
let currentEntityType = null;
let currentAction = 'edit';
let isAscending = true;

document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('authToken')) {
        window.location.href = 'login.html';
        return;
    }
    loadData('/api/admin/cars', 'cars-table', renderCarRow);
    loadData('/api/admin/users', 'users-table', renderUserRow);
    loadData('/api/admin/bookings', 'bookings-table', renderBookingRow);
});

async function loadData(url, tableId, renderFunction) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        const tbody = document.getElementById(tableId).querySelector('tbody');
        tbody.innerHTML = '';
        data.sort((a, b) => a.id - b.id).forEach(item => tbody.appendChild(renderFunction(item)));
    } catch (error) {
        console.error('Ошибка загрузки:', error);
    }
}

function renderUserRow(user) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${user.id}</td>
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>${user.role}</td>
        <td>
            <button class="btn btn-edit" onclick="editEntity('user', ${user.id})">Редакт.</button>
            <button class="btn btn-delete" onclick="deleteEntity('user', ${user.id})">Удалить</button>
        </td>`;
    return row;
}

function renderCarRow(car) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${car.id}</td>
        <td>${car.brand}</td>
        <td>${car.model}</td>
        <td>${car.year}</td>
        <td>${car.pricePerDay} ₸</td>
        <td>${car.available ? '✓' : '✗'}</td>
        <td>
            <button class="btn btn-edit" onclick="editEntity('car', ${car.id})">Редакт.</button>
            <button class="btn btn-delete" onclick="deleteEntity('car', ${car.id})">Удалить</button>
        </td>`;
    return row;
}

function renderBookingRow(booking) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${booking.id}</td>
        <td>${booking.user.name}</td>
        <td>${booking.car.brand} ${booking.car.model}</td>
        <td>${new Date(booking.startDate).toLocaleDateString()}</td>
        <td>${new Date(booking.endDate).toLocaleDateString()}</td>
        <td>${booking.totalPrice} ₸</td>
        <td>
            <button class="btn btn-delete" onclick="deleteEntity('booking', ${booking.id})">Удалить</button>
        </td>`;
    return row;
}

function openTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`${tabName}-tab`).classList.add('active');
    document.querySelector(`button[onclick="openTab('${tabName}')"]`).classList.add('active');
}

async function editEntity(type, id) {
    currentAction = 'edit';
    currentEntityType = type;
    currentEditingId = id;

    try {
        const response = await fetch(`/api/admin/${type}s/${id}`);
        const data = await response.json();
        showEditForm(getEntityFields(type, data));
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        alert('Не удалось загрузить данные для редактирования');
    }
}

function showEditForm(fields) {
    const formContent = document.getElementById('formContent');
    formContent.innerHTML = '';

    for (const [key, config] of Object.entries(fields)) {
        const container = document.createElement('div');
        container.style.marginBottom = '15px';

        const label = document.createElement('label');
        label.textContent = key.charAt(0).toUpperCase() + key.slice(1) + ':';
        label.style.display = 'block';
        label.style.marginBottom = '5px';
        label.style.color = '#666';

        let input;
        if (config.type === 'select') {
            input = document.createElement('select');
            input.name = key;
            input.style.width = '100%';
            input.style.padding = '10px';
            input.style.borderRadius = '8px';
            input.style.border = '1px solid #ddd';

            config.options.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option;
                optionElement.textContent = option;
                if (option === config.value) {
                    optionElement.selected = true;
                }
                input.appendChild(optionElement);
            });
        } else {
            input = document.createElement('input');
            input.type = config.type;
            input.name = key;
            input.value = config.value || '';
            input.style.width = '100%';
            input.style.padding = '10px';
            input.style.borderRadius = '8px';
            input.style.border = '1px solid #ddd';

            if (config.type === 'checkbox') {
                input.checked = config.checked || false;
            }

            if (config.readonly) {
                input.readOnly = true;
            }
        }

        container.appendChild(label);
        container.appendChild(input);
        formContent.appendChild(container);
    }

    const modal = document.getElementById('editModal');
    modal.style.display = 'flex';
}

async function deleteEntity(type, id) {
    if (!confirm('Подтвердите удаление')) return;
    try {
        await fetch(`/api/admin/${type}s/${id}`, { method: 'DELETE' });
        alert('Удалено успешно');
        location.reload();
    } catch (error) {
        console.error('Ошибка удаления:', error);
    }
}

function openAddModal(type) {
    currentAction = 'add';
    currentEntityType = type;
    showEditForm(getEntityFields(type, {}));
}

function getEntityFields(type, data) {
    switch (type) {
        case 'user':
            return {
                name: { type: 'text', value: data.name || '' },
                email: { type: 'email', value: data.email || '' },
                password: { type: 'text', value: data.password || '' },

                role: {
                    type: 'select',
                    value: data.role || 'user',
                    options: ['user', 'admin']
                }
            };
        case 'car':
            return {
                brand: { type: 'text', value: data.brand || '' },
                model: { type: 'text', value: data.model || '' },
                year: { type: 'number', value: data.year || '' },
                pricePerDay: { type: 'number', value: data.pricePerDay || '' },
                available: { type: 'checkbox', checked: data.available || true }
            };
        case 'booking':
            return {
                userId: { type: 'number', value: data.userId || '' },
                carId: { type: 'number', value: data.carId || '' },
                startDate: { type: 'date', value: data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : '' },
                endDate: { type: 'date', value: data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : '' }
            };
        default:
            return {};
    }
}

async function submitForm() {
    const formData = Object.fromEntries(
        Array.from(document.querySelectorAll('#editForm input, #editForm select')).map(element => [
            element.name,
            element.type === 'checkbox' ? element.checked : element.value
        ])
    );

    const url = currentAction === 'add'
        ? `/api/admin/${currentEntityType}s`
        : `/api/admin/${currentEntityType}s/${currentEditingId}`;

    try {
        // Хэширование пароля только для пользователей
        if (currentEntityType === 'user') {
            // Для добавления: всегда хэшируем новый пароль
            if (currentAction === 'add' && formData.password) {
                const hashResponse = await fetch('/api/hash-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password: formData.password })
                });
                const hashResult = await hashResponse.json();
                formData.password = hashResult.hashedPassword;
            }

            // Для редактирования: хэшируем только если пароль изменен
            if (currentAction === 'edit' && formData.password) {
                // Проверяем, был ли изменен пароль
                const currentUser = await fetch(`/api/admin/users/${currentEditingId}`).then(res => res.json());
                if (!passwordEncoder.matches(formData.password, currentUser.password)) {
                    const hashResponse = await fetch('/api/hash-password', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ password: formData.password })
                    });
                    const hashResult = await hashResponse.json();
                    formData.password = hashResult.hashedPassword;
                } else {
                    // Если пароль не изменился - удаляем поле из formData
                    delete formData.password;
                }
            }
        }

        const response = await fetch(url, {
            method: currentAction === 'add' ? 'POST' : 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (!response.ok) throw new Error('Ошибка сервера');
        alert('Сохранено успешно');
        location.reload();
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка сохранения: ' + error.message);
    }
}

function sortTable(tableId, columnIndex) {
    const table = document.getElementById(tableId);
    const rows = Array.from(table.querySelectorAll('tbody tr'));
    const isNumeric = !isNaN(parseFloat(rows[0].cells[columnIndex].textContent));

    rows.sort((a, b) => {
        const aVal = isNumeric
            ? parseFloat(a.cells[columnIndex].textContent)
            : a.cells[columnIndex].textContent;

        const bVal = isNumeric
            ? parseFloat(b.cells[columnIndex].textContent)
            : b.cells[columnIndex].textContent;

        return isAscending ? (aVal > bVal ? 1 : -1) : (bVal > aVal ? 1 : -1);
    });

    isAscending = !isAscending;
    table.querySelector('tbody').innerHTML = '';
    rows.forEach(row => table.querySelector('tbody').appendChild(row));
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

function logout() {
    localStorage.removeItem('authToken');
    window.location.href = 'login.html';
}