package com.example.rentacar.repository;

import com.example.rentacar.model.SiteReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface SiteReviewRepository extends JpaRepository<SiteReview, Long> {
    List<SiteReview> findAllByOrderByCreatedAtDesc();

    @Query("SELECT AVG(s.rating) FROM SiteReview s")
    Double findAverageRating();

    @Query("SELECT COUNT(s) FROM SiteReview s")
    Long countReviews();
}