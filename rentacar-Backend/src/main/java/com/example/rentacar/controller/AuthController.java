package com.example.rentacar.controller;

import com.example.rentacar.model.User;
import com.example.rentacar.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    private static final String ADMIN_EMAIL = "RentCarAdmin@gmail.com";
    private static final String ADMIN_PASSWORD_HASH = "$2a$10$DWfdXnt4RBIcdNOfdGVJweBoh6FkXTe982OXDsMN0RyLU7B9jamNS";

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
            user.setPassword(passwordEncoder.encode(user.getPassword()));
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

        // Администратор
        if (ADMIN_EMAIL.equals(email)) {
            if (passwordEncoder.matches(password, ADMIN_PASSWORD_HASH)) {
                response.put("success", true);
                response.put("message", "Вход выполнен успешно! (Администратор)");
                response.put("role", "admin");
                response.put("userId", 0);
                response.put("name", "admin");
                response.put("email", ADMIN_EMAIL);
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Неверный пароль администратора.");
                return ResponseEntity.ok(response);
            }
        }

        // Обычный пользователь
        User user = userRepository.findByEmail(email);
        if (user != null && passwordEncoder.matches(password, user.getPassword())) {
            response.put("success", true);
            response.put("message", "Вход выполнен успешно!");
            response.put("userId", user.getId());
            response.put("email", user.getEmail());
            response.put("role", user.getRole());
            response.put("name", user.getName());
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

    @PostMapping("/users/{id}/change-password")
    public ResponseEntity<Map<String, Object>> changePassword(
            @PathVariable Long id,
            @RequestBody Map<String, String> passwords) {
        Map<String, Object> response = new HashMap<>();
        String currentPassword = passwords.get("currentPassword");
        String newPassword = passwords.get("newPassword");

        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            response.put("success", false);
            response.put("message", "Пользователь не найден.");
            return ResponseEntity.ok(response);
        }

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            response.put("success", false);
            response.put("message", "Неверный текущий пароль.");
            return ResponseEntity.ok(response);
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        response.put("success", true);
        response.put("message", "Пароль успешно изменен.");
        return ResponseEntity.ok(response);
    }



}