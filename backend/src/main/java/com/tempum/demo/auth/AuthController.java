package com.tempum.demo.auth;

import com.tempum.demo.dto.LoginDTO;
import com.tempum.demo.dto.RegisterDTO;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public String register(@RequestBody RegisterDTO dto) {
        return authService.register(dto);
    }
    
    @PostMapping("/login")
    public String login(@RequestBody LoginDTO dto) {
        return authService.login(dto);
    }
}
