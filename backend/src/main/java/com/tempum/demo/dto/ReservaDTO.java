package com.tempum.demo.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReservaDTO {

    private Long id;
    private String nameClient;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String service;
    private String estado;
    private String motivoCancelacion;



    private UsuarioDTO usuario;
}
