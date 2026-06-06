package com.tempum.demo.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

import lombok.Data;



@Entity
@Data
public class Reserva {
    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;

    private String nameClient;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    private String service;

    private String estado;

    private String motivoCancelacion;



    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;
}
