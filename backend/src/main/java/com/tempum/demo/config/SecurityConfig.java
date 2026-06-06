package com.tempum.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAutFilter;

    @Value("${app.cors.allowed-origins}")
    private List<String> allowedOrigins;

    public SecurityConfig(JwtAuthFilter jwtAutFilter) {
        this.jwtAutFilter = jwtAutFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. Habilitamos CORS configurado con nuestro bean
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                
                .csrf(csrf -> csrf.disable())

                .formLogin(form -> form.disable())

                .httpBasic(httpBasic -> httpBasic.disable())

                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth
                        // 2. Permitimos todas las solicitudes preflight OPTIONS sin autenticación
                        .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/auth/**", "/error").permitAll()
                        .anyRequest().authenticated());

        http.addFilterBefore(jwtAutFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // 3. Definimos la configuración global de CORS para Spring Security
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Permitimos el origen configurado dinámicamente
        configuration.setAllowedOrigins(allowedOrigins);
        // Permitimos todos los métodos HTTP que usa tu aplicación
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        // Habilitamos el envío de cabeceras de autorización y tipos de contenido
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Cache-Control"));
        // Permitimos credenciales
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
