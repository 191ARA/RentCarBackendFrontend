package com.example.rentacar.controller;

import com.example.rentacar.dto.PaymentRequest;
import com.example.rentacar.model.Booking;
import com.example.rentacar.model.Car;
import com.example.rentacar.model.User;
import com.example.rentacar.repository.BookingRepository;
import com.example.rentacar.repository.CarRepository;
import com.example.rentacar.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:3000")
public class BookingController {

    private static final double DEFAULT_DEPOSIT_AMOUNT = 50000.00;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CarRepository carRepository;

    /**
     * Проверка доступности автомобиля для бронирования
     */
    @GetMapping("/availability/{carId}")
    public ResponseEntity<Map<String, Object>> checkAvailability(
            @PathVariable Long carId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date endDate) {

        Map<String, Object> response = new HashMap<>();

        try {
            if (!carRepository.existsById(carId)) {
                throw new IllegalArgumentException("Car not found");
            }

            validateDates(startDate, endDate);
            boolean isAvailable = bookingRepository.isCarAvailable(carId, startDate, endDate);

            response.put("success", true);
            response.put("available", isAvailable);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Создание нового бронирования
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createBooking(@RequestBody BookingRequestDTO bookingRequest) {
        Map<String, Object> response = new HashMap<>();

        try {
            // Валидация входных данных
            validateBookingRequest(bookingRequest);

            User user = userRepository.findById(bookingRequest.getUserId())
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            Car car = carRepository.findById(bookingRequest.getCarId())
                    .orElseThrow(() -> new IllegalArgumentException("Car not found"));

            // Проверка доступности автомобиля
            if (!bookingRepository.isCarAvailable(car.getId(), bookingRequest.getStartDate(), bookingRequest.getEndDate())) {
                throw new IllegalStateException("Car is not available for selected dates");
            }

            // Создание бронирования
            Booking booking = createNewBooking(user, car, bookingRequest);
            Booking savedBooking = bookingRepository.save(booking);

            // Формирование ответа
            response.put("success", true);
            response.put("message", "Booking created successfully");
            response.put("bookingId", savedBooking.getId());
            response.put("totalPrice", savedBooking.getTotalPrice());
            response.put("depositAmount", savedBooking.getDepositAmount());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Получение списка бронирований пользователя
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<Map<String, Object>> getUserBookings(@PathVariable Long userId) {
        Map<String, Object> response = new HashMap<>();

        try {
            if (!userRepository.existsById(userId)) {
                throw new IllegalArgumentException("User not found");
            }

            List<Booking> bookings = bookingRepository.findByUserId(userId);

            response.put("success", true);
            response.put("bookings", bookings);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Отмена бронирования
     */
    @DeleteMapping("/cancel/{bookingId}")
    public ResponseEntity<Map<String, Object>> cancelBooking(@PathVariable Long bookingId) {
        Map<String, Object> response = new HashMap<>();

        try {
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

            // Проверка возможности отмены
            if (!booking.isActive()) {
                throw new IllegalStateException("Booking is already cancelled");
            }

            // Удаление бронирования
            bookingRepository.delete(booking);

            response.put("success", true);
            response.put("message", "Booking cancelled successfully");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Оплата залога
     */
    @PostMapping("/pay-deposit/{bookingId}")
    public ResponseEntity<Map<String, Object>> payDeposit(@PathVariable Long bookingId) {
        Map<String, Object> response = new HashMap<>();

        try {
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

            // Проверки перед оплатой
            if (!booking.isActive()) {
                throw new IllegalStateException("Cannot pay deposit for cancelled booking");
            }

            if (booking.isDepositPaid()) {
                throw new IllegalStateException("Deposit already paid");
            }

            // Обновление статуса оплаты
            booking.setDepositPaid(true);
            bookingRepository.save(booking);

            response.put("success", true);
            response.put("message", "Deposit paid successfully");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Проверка статуса оплаты залога
     */
    @GetMapping("/deposit-status/{bookingId}")
    public ResponseEntity<Map<String, Object>> getDepositStatus(@PathVariable Long bookingId) {
        Map<String, Object> response = new HashMap<>();

        try {
            Boolean isPaid = bookingRepository.isDepositPaid(bookingId);

            if (isPaid == null) {
                throw new IllegalArgumentException("Booking not found");
            }

            response.put("success", true);
            response.put("isPaid", isPaid);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Возврат залога
     */
    @PutMapping("/return-deposit/{bookingId}")
    public ResponseEntity<Map<String, Object>> returnDeposit(@PathVariable Long bookingId) {
        Map<String, Object> response = new HashMap<>();

        try {
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

            // Проверки перед возвратом
            if (!booking.isDepositPaid()) {
                throw new IllegalStateException("Deposit was not paid");
            }

            // Обновление статуса
            booking.setDepositPaid(false);
            bookingRepository.save(booking);

            response.put("success", true);
            response.put("message", "Deposit returned successfully");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Получение деталей бронирования
     */
    @GetMapping("/{bookingId}")
    public ResponseEntity<Map<String, Object>> getBookingDetails(@PathVariable Long bookingId) {
        Map<String, Object> response = new HashMap<>();

        try {
            Booking booking = bookingRepository.findByIdWithUserAndCar(bookingId)
                    .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

            response.put("success", true);
            response.put("booking", booking);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // ========== Вспомогательные методы ==========

    private void validateBookingRequest(BookingRequestDTO request) {
        if (request == null) {
            throw new IllegalArgumentException("Booking request cannot be null");
        }

        validateDates(request.getStartDate(), request.getEndDate());

        if (request.getUserId() == null) {
            throw new IllegalArgumentException("User ID is required");
        }

        if (request.getCarId() == null) {
            throw new IllegalArgumentException("Car ID is required");
        }
    }

    private void validateDates(Date startDate, Date endDate) {
        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException("Start and end dates are required");
        }

        if (endDate.before(startDate)) {
            throw new IllegalArgumentException("End date cannot be before start date");
        }

        if (startDate.before(new Date())) {
            throw new IllegalArgumentException("Start date cannot be in the past");
        }
    }

    private Booking createNewBooking(User user, Car car, BookingRequestDTO request) {
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setCar(car);
        booking.setStartDate(request.getStartDate());
        booking.setEndDate(request.getEndDate());

        // Расчет общей стоимости
        long days = (request.getEndDate().getTime() - request.getStartDate().getTime()) / (1000 * 60 * 60 * 24);
        double totalPrice = days * car.getPricePerDay();
        booking.setTotalPrice(totalPrice);

        // Установка статусов
        booking.setActive(true);
        booking.setDepositPaid(false);
        booking.setDepositAmount(DEFAULT_DEPOSIT_AMOUNT);

        return booking;
    }
}

/**
 * DTO для запроса на бронирование
 */
class BookingRequestDTO {
    private Long userId;
    private Long carId;
    private Date startDate;
    private Date endDate;

    // Геттеры и сеттеры
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getCarId() { return carId; }
    public void setCarId(Long carId) { this.carId = carId; }

    public Date getStartDate() { return startDate; }
    public void setStartDate(Date startDate) { this.startDate = startDate; }

    public Date getEndDate() { return endDate; }
    public void setEndDate(Date endDate) { this.endDate = endDate; }
}