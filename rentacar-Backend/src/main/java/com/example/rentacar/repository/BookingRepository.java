package com.example.rentacar.repository;

import com.example.rentacar.model.Booking;
import com.example.rentacar.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Date;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    // Найти все бронирования пользователя
    @Query("SELECT b FROM Booking b WHERE b.user.id = :userId ORDER BY b.startDate DESC")
    List<Booking> findByUserId(@Param("userId") Long userId);

    // Проверить, оплачен ли залог
    @Query("SELECT b.depositPaid FROM Booking b WHERE b.id = :bookingId")
    Boolean isDepositPaid(@Param("bookingId") Long bookingId);

    // Найти бронирование с информацией о пользователе и автомобиле
    @Query("SELECT b FROM Booking b LEFT JOIN FETCH b.user LEFT JOIN FETCH b.car WHERE b.id = :bookingId")
    Optional<Booking> findByIdWithUserAndCar(@Param("bookingId") Long bookingId);

    // Подсчет активных бронирований для автомобиля в заданный период
    @Query("SELECT COUNT(b) FROM Booking b WHERE "
            + "b.car.id = :carId AND "
            + "b.active = true AND "
            + "(:startDate < b.endDate AND :endDate > b.startDate)")
    int countActiveBookingsForCar(
            @Param("carId") Long carId,
            @Param("startDate") Date startDate,
            @Param("endDate") Date endDate
    );

    // Проверка доступности автомобиля
    default boolean isCarAvailable(Long carId, Date startDate, Date endDate) {
        return countActiveBookingsForCar(carId, startDate, endDate) == 0;
    }

    // Найти активные бронирования пользователя
    @Query("SELECT b FROM Booking b WHERE b.user = :user AND b.active = true ORDER BY b.startDate")
    List<Booking> findActiveByUser(@Param("user") User user);

    // Найти все бронирования с информацией о пользователе и автомобиле
    @Query("SELECT b FROM Booking b JOIN FETCH b.user JOIN FETCH b.car ORDER BY b.startDate DESC")
    List<Booking> findAllWithUserAndCar();

    // Найти текущие активные бронирования
    @Query("SELECT b FROM Booking b WHERE b.active = true AND CURRENT_DATE BETWEEN b.startDate AND b.endDate")
    List<Booking> findCurrentActiveBookings();

    // Найти будущие бронирования
    @Query("SELECT b FROM Booking b WHERE b.active = true AND b.startDate > CURRENT_DATE")
    List<Booking> findUpcomingBookings();
}