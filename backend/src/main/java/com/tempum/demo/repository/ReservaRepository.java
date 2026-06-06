package com.tempum.demo.repository;

import com.tempum.demo.model.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;



public interface ReservaRepository extends JpaRepository<Reserva, Long> {
    List <Reserva> findByStartDateLessThanAndEndDateGreaterThan(
            LocalDateTime endDate,
            LocalDateTime startDate
    );
}


