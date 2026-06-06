package com.tempum.demo.dto;

import lombok.Data;

@Data
public class RegisterDTO {
    private String nombre;
    private String email;
    private String password;
    private String rol;

}