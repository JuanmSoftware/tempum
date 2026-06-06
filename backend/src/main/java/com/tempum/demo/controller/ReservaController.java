package com.tempum.demo.controller;

import com.tempum.demo.model.Reserva;
import com.tempum.demo.service.ReservaService;
import com.tempum.demo.repository.ReservaRepository;
import org.springframework.beans.factory.annotation.*;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.DeleteMapping;
import java.util.List;
import com.tempum.demo.dto.ReservaDTO;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestParam;
import com.tempum.demo.dto.CrearReservaDTO;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.tempum.demo.model.Usuario;


@RestController
@RequestMapping("/reservas")
public class ReservaController {

    private final ReservaService reservaService;

    public ReservaController(ReservaService reservaService) {
        this.reservaService = reservaService;
    }

    @PostMapping
    public ReservaDTO crearReserva(@Valid @RequestBody CrearReservaDTO dto, @AuthenticationPrincipal Usuario usuario) {
        return reservaService.crearDesdeDTO(dto, usuario.getId());
    }

    @GetMapping
    public List<ReservaDTO> obtenerReservas() {
        return reservaService.obtenerReservas();
    }

    @GetMapping("/{id}")
    public ReservaDTO obtenerReservaPorId(@PathVariable Long id) {
        return reservaService.obtenerReservaPorId(id);
        }

    @DeleteMapping("/{id}")
    public void eliminarReserva(@PathVariable Long id) {
        reservaService.eliminarReserva(id);
    }

    @PatchMapping("/{id}/confirmar")
    @PreAuthorize("hasRole('ADMIN')")
    public ReservaDTO confirmarReserva(@PathVariable Long id) {
        return reservaService.confirmarReserva(id);
    }

    @PatchMapping("/{id}/cancelar")
    @PreAuthorize("hasRole('ADMIN')")
    public ReservaDTO cancelarReserva(@PathVariable Long id, @RequestParam(required = false) String motivo) {
        return reservaService.cancelarReserva(id, motivo);
    }

}

