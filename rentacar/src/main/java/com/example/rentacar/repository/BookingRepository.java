

package com.example.rentacar.repository;

import com.example.rentacar.model.Booking;
import com.example.rentacar.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    @Query("SELECT b FROM Booking b JOIN b.car c WHERE b.user.id = :userId")
    List<Booking> findBookingsByUserId(@Param("userId") Long userId);



    List<Booking> findByUser(User user);


    @Query("SELECT b FROM Booking b JOIN FETCH b.user JOIN FETCH b.car")
    List<Booking> findAllWithUserAndCar();
}
