package com.example.demo.service;

import com.example.demo.model.*;
import com.example.demo.repository.ReservaAprobacionRepository;
import com.example.demo.repository.ReservaRepository;
import com.example.demo.repository.UsuarioLocalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ReservaService {

    @Autowired
    private ReservaRepository reservaRepository;

    @Autowired
    private ReservaAprobacionRepository aprobacionRepository;

    @Autowired
    private UsuarioLocalRepository usuarioLocalRepository;

    public List<Reserva> findAll() {
        return reservaRepository.findAll();
    }

    public Optional<Reserva> findById(Long id) {
        return reservaRepository.findById(id);
    }

    public List<Reserva> findByUsuarioId(Long usuarioId) {
        return reservaRepository.findByUsuarioId(usuarioId);
    }

    public List<Reserva> findByLocalId(Long localId) {
        return reservaRepository.findByLocalId(localId);
    }

    public List<Reserva> findByEstado(ReservaEstado estado) {
        return reservaRepository.findByEstado(estado);
    }

    @Transactional
    public Reserva save(Reserva reserva) {
        if (reserva.getId() == null) {
            return crearNuevaReserva(reserva);
        } else {
            return actualizarReserva(reserva);
        }
    }

    private Reserva crearNuevaReserva(Reserva reserva) {
        if (reserva.getFechaInicio().isAfter(reserva.getFechaFin())) {
            throw new IllegalArgumentException("La fecha de inicio debe ser anterior a la fecha de fin");
        }

        List<Reserva> conflictos = reservaRepository.findConflictingReservas(
            reserva.getLocal().getId(),
            reserva.getFechaInicio(),
            reserva.getFechaFin()
        );

        if (!conflictos.isEmpty()) {
            throw new IllegalStateException("Ya existe una reserva en ese horario");
        }

        if (reserva.getEsReservaDiaCompleto()) {
            reserva.setEstado(ReservaEstado.PENDIENTE_APROBACIONES);
            Reserva reservaGuardada = reservaRepository.save(reserva);
            crearAprobaciones(reservaGuardada);
            return reservaGuardada;
        } else {
            reserva.setEstado(ReservaEstado.CONFIRMADA);
            return reservaRepository.save(reserva);
        }
    }

    private Reserva actualizarReserva(Reserva reserva) {
        if (reserva.getFechaInicio().isAfter(reserva.getFechaFin())) {
            throw new IllegalArgumentException("La fecha de inicio debe ser anterior a la fecha de fin");
        }

        List<Reserva> conflictos = reservaRepository.findConflictingReservasExcluding(
            reserva.getLocal().getId(),
            reserva.getId(),
            reserva.getFechaInicio(),
            reserva.getFechaFin()
        );

        if (!conflictos.isEmpty()) {
            throw new IllegalStateException("Ya existe una reserva en ese horario");
        }

        return reservaRepository.save(reserva);
    }

    private void crearAprobaciones(Reserva reserva) {
        List<UsuarioLocal> usuariosDelLocal = usuarioLocalRepository.findByLocalId(reserva.getLocal().getId());

        for (UsuarioLocal ul : usuariosDelLocal) {
            if (!ul.getUsuario().getId().equals(reserva.getUsuario().getId())) {
                ReservaAprobacion aprobacion = new ReservaAprobacion();
                aprobacion.setReserva(reserva);
                aprobacion.setUsuario(ul.getUsuario());
                aprobacion.setAprobada(null);
                aprobacionRepository.save(aprobacion);
            }
        }
    }

    @Transactional
    public void responderAprobacion(Long aprobacionId, Boolean aprobada) {
        Optional<ReservaAprobacion> aprobacionOpt = aprobacionRepository.findById(aprobacionId);
        if (aprobacionOpt.isEmpty()) {
            throw new IllegalArgumentException("Aprobación no encontrada");
        }

        ReservaAprobacion aprobacion = aprobacionOpt.get();
        aprobacion.setAprobada(aprobada);
        aprobacion.setFechaRespuesta(LocalDateTime.now());
        aprobacionRepository.save(aprobacion);

        actualizarEstadoReserva(aprobacion.getReserva().getId());
    }

    private void actualizarEstadoReserva(Long reservaId) {
        Optional<Reserva> reservaOpt = reservaRepository.findById(reservaId);
        if (reservaOpt.isEmpty()) {
            return;
        }

        Reserva reserva = reservaOpt.get();
        List<ReservaAprobacion> aprobaciones = aprobacionRepository.findByReservaId(reservaId);

        boolean hayRechazos = aprobaciones.stream().anyMatch(a -> Boolean.FALSE.equals(a.getAprobada()));
        if (hayRechazos) {
            reserva.setEstado(ReservaEstado.RECHAZADA);
            reservaRepository.save(reserva);
            return;
        }

        boolean todasAprobadas = aprobaciones.stream().allMatch(a -> Boolean.TRUE.equals(a.getAprobada()));
        if (todasAprobadas && !aprobaciones.isEmpty()) {
            reserva.setEstado(ReservaEstado.APROBADA);
            reservaRepository.save(reserva);
        }
    }

    public List<ReservaAprobacion> findAprobacionesByReservaId(Long reservaId) {
        return aprobacionRepository.findByReservaId(reservaId);
    }

    public List<ReservaAprobacion> findAprobacionesPendientesByUsuarioId(Long usuarioId) {
        return aprobacionRepository.findByUsuarioId(usuarioId).stream()
            .filter(a -> a.getAprobada() == null)
            .toList();
    }

    public void deleteById(Long id) {
        reservaRepository.deleteById(id);
    }
}