package com.example.rentacar.controller;

import com.example.rentacar.model.User;
import com.example.rentacar.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    private static final String ADMIN_EMAIL = "RentCarAdmin@gmail.com";
    private static final String ADMIN_PASSWORD = "123123";

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody User user) {
        Map<String, Object> response = new HashMap<>();

        if (ADMIN_EMAIL.equals(user.getEmail())) {
            response.put("success", false);
            response.put("message", "Регистрация администратора запрещена.");
            return ResponseEntity.ok(response);
        }

        if (userRepository.findByEmail(user.getEmail()) != null) {
            response.put("success", false);
            response.put("message", "Пользователь с таким email уже существует.");
        } else {
            userRepository.save(user);
            response.put("success", true);
            response.put("message", "Регистрация выполнена успешно!");
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        Map<String, Object> response = new HashMap<>();

        // Проверка аутентификации администратора
        if (ADMIN_EMAIL.equals(email) && ADMIN_PASSWORD.equals(password)) {
            response.put("success", true);
            response.put("message", "Вход выполнен успешно! (Администратор)");
            response.put("role", "admin");
            return ResponseEntity.ok(response);
        }

        // Проверка аутентификации обычного пользователя
        User user = userRepository.findByEmail(email);
        if (user != null && user.getPassword().equals(password)) {
            response.put("success", true);
            response.put("message", "Вход выполнен успешно!");
            response.put("userId", user.getId());
            response.put("role", "user");
        } else {
            response.put("success", false);
            response.put("message", "Неверный email или пароль.");
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        User user = userRepository.findById(id).orElse(null);
        if (user != null) {
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
