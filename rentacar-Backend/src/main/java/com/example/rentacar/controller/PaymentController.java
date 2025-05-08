package com.example.rentacar.controller;

import com.example.rentacar.dto.PaymentRequest;
import com.example.rentacar.model.Booking;
import com.example.rentacar.repository.BookingRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:3000")
public class PaymentController {

    private final BookingRepository bookingRepository;

    public PaymentController(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    @PostMapping("/process")
    public ResponseEntity<Map<String, Object>> processPayment(@RequestBody PaymentRequest paymentRequest) {
        Map<String, Object> response = new HashMap<>();

        try {
            // Валидация данных карты
            validatePaymentRequest(paymentRequest);

            // Проверка существования бронирования
            Booking booking = bookingRepository.findById(paymentRequest.getBookingId())
                    .orElseThrow(() -> new IllegalArgumentException("Бронирование не найдено"));

            if (booking.isDepositPaid()) {
                throw new IllegalStateException("Залог уже оплачен");
            }

            // Имитация обработки платежа (90% успешных)
            boolean success = new Random().nextInt(10) < 9;

            if (success) {
                // Обновляем статус оплаты
                booking.setDepositPaid(true);
                bookingRepository.save(booking);

                response.put("success", true);
                response.put("message", "Оплата прошла успешно (демо-режим)");
                response.put("transactionId", "DEMO-" + System.currentTimeMillis());
            } else {
                response.put("success", false);
                response.put("message", "Оплата отклонена банком (демо-режим)");
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Ошибка: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    private void validatePaymentRequest(PaymentRequest request) {
        if (request.getCardNumber() == null || request.getCardNumber().replaceAll("\\s", "").length() != 16) {
            throw new IllegalArgumentException("Неверный номер карты (требуется 16 цифр)");
        }

        if (request.getExpiryDate() == null || !request.getExpiryDate().matches("(0[1-9]|1[0-2])/[0-9]{2}")) {
            throw new IllegalArgumentException("Неверный срок действия (формат ММ/ГГ)");
        }

        if (request.getCvv() == null || !request.getCvv().matches("\\d{3}")) {
            throw new IllegalArgumentException("Неверный CVV код (требуется 3 цифры)");
        }

        if (request.getAmount() <= 0) {
            throw new IllegalArgumentException("Неверная сумма оплаты");
        }
    }
}