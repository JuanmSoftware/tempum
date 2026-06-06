package com.tempum.demo.config;

import com.tempum.demo.model.Usuario;
import com.tempum.demo.repository.UsuarioRepository;
import com.tempum.demo.security.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;

    public JwtAuthFilter(JwtService jwtService, UsuarioRepository usuarioRepository) {
        this.jwtService = jwtService;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        try {

            String email = jwtService.extractEmail(token);

            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);

                if (usuarioOpt.isPresent()) {
                    Usuario usuario = usuarioOpt.get();

                    if (jwtService.isTokenValid(token, usuario.getEmail())) {
                        String roleName = usuario.getRol();
                        if (roleName != null) {
                            if (!roleName.startsWith("ROLE_")) {
                                roleName = "ROLE_" + roleName.toUpperCase();
                            }
                        } else {
                            roleName = "ROLE_USER";
                        }
                        SimpleGrantedAuthority authority = new SimpleGrantedAuthority(roleName);

                        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                usuario,
                                null,
                                List.of(authority));

                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                        SecurityContextHolder.getContext().setAuthentication(authToken);
                    }
                }
            }
        } catch (Exception e) {

            System.err.println("Error al validar el token JWT: " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
