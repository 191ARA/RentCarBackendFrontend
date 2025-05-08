package com.example.rentacar.util;

import com.example.rentacar.model.Booking;
import com.example.rentacar.model.Car;
import com.example.rentacar.repository.BookingRepository;
import com.example.rentacar.repository.CarRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.List;

@Component
public class CarAvailabilityScheduler {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private CarRepository carRepository;



}