package com.example.rentacar.controller;

import com.example.rentacar.model.Booking;
import com.example.rentacar.model.Car;
import com.example.rentacar.model.User;
import com.example.rentacar.repository.BookingRepository;
import com.example.rentacar.repository.CarRepository;
import com.example.rentacar.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CarRepository carRepository;

    // Метод для бронирования автомобиля
    @PostMapping
    public ResponseEntity<Map<String, Object>> bookCar(@RequestBody Map<String, Object> bookingData) {
        Map<String, Object> response = new HashMap<>();

        try {
            // Извлечение данных из запроса
            Long userId = Long.valueOf(bookingData.get("userId").toString());
            Long carId = Long.valueOf(bookingData.get("carId").toString());
            Date startDate = new Date(Long.parseLong(bookingData.get("startDate").toString()));
            Date endDate = new Date(Long.parseLong(bookingData.get("endDate").toString()));

            // Поиск пользователя и автомобиля по ID
            User user = userRepository.findById(userId).orElse(null);
            Car car = carRepository.findById(carId).orElse(null);

            // Проверка наличия пользователя и автомобиля
            if (user == null || car == null) {
                response.put("success", false);
                response.put("message", "Пользователь или автомобиль не найдены.");
                return ResponseEntity.badRequest().body(response);
            }

            // Проверка доступности автомобиля
            if (!car.isAvailable()) {
                response.put("success", false);
                response.put("message", "Автомобиль уже забронирован.");
                return ResponseEntity.badRequest().body(response);
            }

            // Расчет общей стоимости
            long diffInMillies = endDate.getTime() - startDate.getTime();
            long days = diffInMillies / (1000 * 60 * 60 * 24);
            double totalPrice = car.getPricePerDay() * days;

            // Создание объекта бронирования
            Booking booking = new Booking();
            booking.setUser(user);
            booking.setCar(car);
            booking.setStartDate(startDate);
            booking.setEndDate(endDate);
            booking.setTotalPrice(totalPrice);

            // Сохранение объекта бронирования в базе данных
            bookingRepository.save(booking);

            // Обновление статуса автомобиля (недоступен для последующих бронирований)
            car.setAvailable(false);
            carRepository.save(car);

            // Успешный ответ
            response.put("success", true);
            response.put("message", "Автомобиль успешно забронирован.");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            // Обработка ошибок при бронировании
            response.put("success", false);
            response.put("message", "Ошибка при бронировании: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    // Метод для получения всех бронирований пользователя
    @GetMapping
    public ResponseEntity<Map<String, Object>> getUserBookings(@RequestParam Long userId) {
        Map<String, Object> response = new HashMap<>();

        try {
            // Получаем все бронирования пользователя по его ID
            User user = userRepository.findById(userId).orElse(null);

            if (user == null) {
                response.put("success", false);
                response.put("message", "Пользователь не найден.");
                return ResponseEntity.badRequest().body(response);
            }

            // Получаем список всех бронирований этого пользователя
            Iterable<Booking> bookings = bookingRepository.findByUser(user);

            // Добавляем все бронирования в ответ
            response.put("success", true);
            response.put("bookings", bookings);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            // Обработка ошибок при получении бронирований
            response.put("success", false);
            response.put("message", "Ошибка при получении бронирований: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
