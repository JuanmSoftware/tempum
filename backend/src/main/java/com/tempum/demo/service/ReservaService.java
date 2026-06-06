package com.tempum.demo.service;

import com.tempum.demo.model.Reserva;
import com.tempum.demo.repository.ReservaRepository;
import org.springframework.stereotype.Service;
import com.tempum.demo.exception.HorarioNoDisponibleException;
import com.tempum.demo.exception.RecursoNoEncontradoException;
import com.tempum.demo.model.Usuario;
import com.tempum.demo.repository.UsuarioRepository;
import com.tempum.demo.dto.ReservaDTO;
import com.tempum.demo.dto.UsuarioDTO;
import com.tempum.demo.dto.CrearReservaDTO;
import java.util.List;

@Service
public class ReservaService {

    private final ReservaRepository reservaRepository;
    private final UsuarioRepository usuarioRepository;

    public ReservaService(ReservaRepository reservaRepository, UsuarioRepository usuarioRepository) {
        this.reservaRepository = reservaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public ReservaDTO crearDesdeEntidad(Reserva reserva, Long usuarioId) {
        Reserva nuevaReserva = crearReserva(reserva, usuarioId);
        return mapToDTO(nuevaReserva);
    }

    public Reserva crearReserva(Reserva nuevaReserva, Long usuarioId) {
        if (nuevaReserva.getEndDate().isBefore(nuevaReserva.getStartDate())) {
            throw new IllegalArgumentException("La fecha de fin no puede ser anterior a la fecha de inicio");
        }

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        List<Reserva> conflictos = reservaRepository.findByStartDateLessThanAndEndDateGreaterThan(
                nuevaReserva.getEndDate(),
                nuevaReserva.getStartDate());

        if (!conflictos.isEmpty()) {
            throw new HorarioNoDisponibleException("El horario seleccionado no está disponible");
        }

        nuevaReserva.setUsuario(usuario);
        nuevaReserva.setEstado("PENDIENTE");

        return reservaRepository.save(nuevaReserva);
    }

    public List<ReservaDTO> obtenerReservas() {
        return reservaRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    public ReservaDTO obtenerReservaPorId(Long id) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Reserva no encontrada "));
        return mapToDTO(reserva);
    }

    public void eliminarReserva(Long id) {
        if (!reservaRepository.existsById(id)) {
            throw new RecursoNoEncontradoException("Reserva no encontrada");
        }
        reservaRepository.deleteById(id);
    }

    public ReservaDTO confirmarReserva(Long id) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Reserva no encontrada"));
        reserva.setEstado("CONFIRMADA");
        Reserva reservaActualizada = reservaRepository.save(reserva);
        return mapToDTO(reservaActualizada);
    }

    public ReservaDTO cancelarReserva(Long id, String motivoCancelacion) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Reserva no encontrada"));
        reserva.setEstado("CANCELADA");
        reserva.setMotivoCancelacion(motivoCancelacion); // Guardamos el motivo en el modelo
        Reserva reservaActualizada = reservaRepository.save(reserva);
        return mapToDTO(reservaActualizada);
    }

    private ReservaDTO mapToDTO(Reserva reserva) {
        UsuarioDTO usuarioDTO = new UsuarioDTO();
        usuarioDTO.setId(reserva.getUsuario().getId());
        usuarioDTO.setNombre(reserva.getUsuario().getNombre());
        usuarioDTO.setEmail(reserva.getUsuario().getEmail());
        usuarioDTO.setRol(reserva.getUsuario().getRol());

        ReservaDTO dto = new ReservaDTO();
        dto.setId(reserva.getId());
        dto.setNameClient(reserva.getNameClient());
        dto.setStartDate(reserva.getStartDate());
        dto.setEndDate(reserva.getEndDate());
        dto.setService(reserva.getService());
        dto.setEstado(reserva.getEstado());
        dto.setMotivoCancelacion(reserva.getMotivoCancelacion()); // Mapeamos el motivo al DTO
        dto.setUsuario(usuarioDTO);

        return dto;

    }

    public ReservaDTO crearDesdeDTO(CrearReservaDTO dto, Long usuarioId) {
        Reserva reserva = new Reserva();
        reserva.setNameClient(dto.getNameClient());
        reserva.setStartDate(dto.getStartDate());
        reserva.setEndDate(dto.getEndDate());
        reserva.setService(dto.getService());

        return crearDesdeEntidad(reserva, usuarioId);
    }

}
