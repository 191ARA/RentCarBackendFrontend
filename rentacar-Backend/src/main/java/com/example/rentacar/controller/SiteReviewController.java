package com.example.rentacar.controller;

import com.example.rentacar.model.SiteReview;
import com.example.rentacar.model.User;
import com.example.rentacar.repository.SiteReviewRepository;
import com.example.rentacar.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/site-reviews")

public class SiteReviewController {

    @Autowired
    private SiteReviewRepository siteReviewRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> createReview(
            @RequestBody SiteReview review,
            @RequestHeader("Authorization") Long userId) {

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "message", "User not found"));
        }

        review.setUser(user);
        review.setCreatedAt(LocalDateTime.now());

        siteReviewRepository.save(review);

        return ResponseEntity.ok(
                Map.of("success", true, "message", "Review added successfully"));
    }

    @GetMapping
    public List<SiteReview> getAllReviews() {
        return siteReviewRepository.findAllByOrderByCreatedAtDesc();
    }

    @GetMapping("/stats")
    public Map<String, Object> getReviewStats() {
        Double average = siteReviewRepository.findAverageRating();
        Long count = siteReviewRepository.countReviews();

        Map<String, Object> response = new HashMap<>();
        response.put("averageRating", average != null ? Math.round(average * 10) / 10.0 : 0);
        response.put("totalReviews", count);

        return response;
    }
}