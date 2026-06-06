package com.tempum.demo.auth;

import com.tempum.demo.dto.LoginDTO;
import com.tempum.demo.dto.RegisterDTO;
import com.tempum.demo.model.Usuario;
import com.tempum.demo.repository.UsuarioRepository;
import com.tempum.demo.security.JwtService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service


public class AuthService {
    
    private final UsuarioRepository usuarioRepository;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthService(
        UsuarioRepository usuarioRepository,
        JwtService jwtService,
        BCryptPasswordEncoder passwordEncoder
    )
    {
        this.usuarioRepository = usuarioRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }


    public String register(RegisterDTO dto ){
        Usuario usuario = new Usuario();
        
        usuario.setNombre(dto.getNombre());
        usuario.setEmail(dto.getEmail());
        
        usuario.setPassword(
            passwordEncoder.encode(dto.getPassword())
        );
        
        usuario.setRol(dto.getRol());

        usuarioRepository.save(usuario);
        return "Usuario registrado correctamente";
    }

    public String login(LoginDTO dto){
        Usuario usuario = usuarioRepository.findByEmail(dto.getEmail())
        .orElseThrow(()-> new RuntimeException("Usuario no encontrado"));
        
        boolean passwordCorrecta = passwordEncoder.matches
        (dto.getPassword(), 
        usuario.getPassword()
    );
    
    if(!passwordCorrecta) {
        throw new RuntimeException("Credenciales incorrectas");

    }
    
    return jwtService.generateToken(usuario.getEmail(), usuario.getRol());
        
    }
}
