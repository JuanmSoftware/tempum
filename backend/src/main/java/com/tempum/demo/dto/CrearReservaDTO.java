package com.tempum.demo.dto;

import lombok.Data;
import java.time.LocalDateTime;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
public class CrearReservaDTO {

    @NotBlank(message = "El nombre del cliente es obligatorio")
    private String nameClient;

    @NotNull(message = "La fecha de inicio es obligatoria")
    private LocalDateTime startDate;

    @NotNull(message = "La fecha de fin es obligatoria")
    private LocalDateTime endDate;

    @NotBlank(message = "El servicio es obligatorio")
    private String service;

    private String estado;


}
