package com.tempum.demo.exception;

public class HorarioNoDisponibleException extends RuntimeException {
    public HorarioNoDisponibleException(String mensaje){
        super(mensaje);
    }
}
