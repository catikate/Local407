package com.example.demo.service;

import com.example.demo.model.*;
import com.example.demo.repository.BandaRepository;
import com.example.demo.repository.ReservaAprobacionRepository;
import com.example.demo.repository.ReservaRepository;
import com.example.demo.repository.UsuarioLocalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ReservaService {

    @Autowired
    private ReservaRepository reservaRepository;

    @Autowired
    private ReservaAprobacionRepository aprobacionRepository;

    @Autowired
    private UsuarioLocalRepository usuarioLocalRepository;

    @Autowired
    private BandaRepository bandaRepository;

    public List<Reserva> findAll() {
        return reservaRepository.findAll();
    }

    public Optional<Reserva> findById(Long id) {
        return reservaRepository.findById(id);
    }

    public List<Reserva> findByUsuarioId(Long usuarioId) {
        return reservaRepository.findByUsuarioId(usuarioId);
    }

    // Obtener TODAS las reservas de los locales del usuario
    // Esto permite que todos los usuarios del local vean todas las reservas
    // para evitar solapamientos y organizar el espacio compartido
    public List<Reserva> findByUsuarioYBandas(Long usuarioId) {
        java.util.Set<Long> localIds = new java.util.HashSet<>();

        // 1. Agregar locales donde el usuario está directamente (tabla UsuarioLocal)
        List<UsuarioLocal> usuarioLocales = usuarioLocalRepository.findByUsuarioId(usuarioId);
        for (UsuarioLocal ul : usuarioLocales) {
            localIds.add(ul.getLocal().getId());
        }

        // 2. Agregar locales de las bandas del usuario
        List<Banda> bandasDelUsuario = bandaRepository.findAll().stream()
                .filter(banda -> banda.getMiembros() != null &&
                        banda.getMiembros().stream().anyMatch(m -> m.getId().equals(usuarioId)))
                .collect(Collectors.toList());

        for (Banda banda : bandasDelUsuario) {
            if (banda.getLocal() != null) {
                localIds.add(banda.getLocal().getId());
            }
        }

        // 3. Obtener TODAS las reservas de esos locales
        List<Reserva> todasReservas = new ArrayList<>();
        for (Long localId : localIds) {
            todasReservas.addAll(reservaRepository.findByLocalId(localId));
        }

        return todasReservas;
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
        Long localId = reserva.getLocal().getId();
        Long usuarioSolicitanteId = reserva.getUsuario().getId();

        // Set para evitar duplicados
        java.util.Set<Long> usuariosIds = new java.util.HashSet<>();

        // 1. Agregar usuarios directos del local (tabla UsuarioLocal)
        List<UsuarioLocal> usuariosDelLocal = usuarioLocalRepository.findByLocalId(localId);
        for (UsuarioLocal ul : usuariosDelLocal) {
            if (!ul.getUsuario().getId().equals(usuarioSolicitanteId)) {
                usuariosIds.add(ul.getUsuario().getId());
            }
        }

        // 2. Agregar miembros de TODAS las bandas que están en este local
        List<Banda> bandasDelLocal = bandaRepository.findAll().stream()
                .filter(banda -> banda.getLocal() != null && banda.getLocal().getId().equals(localId))
                .collect(Collectors.toList());

        for (Banda banda : bandasDelLocal) {
            if (banda.getMiembros() != null) {
                for (Usuario miembro : banda.getMiembros()) {
                    if (!miembro.getId().equals(usuarioSolicitanteId)) {
                        usuariosIds.add(miembro.getId());
                    }
                }
            }
        }

        // 3. Crear aprobaciones para todos los usuarios únicos
        for (Long usuarioId : usuariosIds) {
            // Buscar el usuario completo
            Optional<Usuario> usuarioOpt = usuariosDelLocal.stream()
                    .map(UsuarioLocal::getUsuario)
                    .filter(u -> u.getId().equals(usuarioId))
                    .findFirst();

            // Si no está en UsuarioLocal, buscarlo de las bandas
            if (usuarioOpt.isEmpty()) {
                for (Banda banda : bandasDelLocal) {
                    usuarioOpt = banda.getMiembros().stream()
                            .filter(u -> u.getId().equals(usuarioId))
                            .findFirst();
                    if (usuarioOpt.isPresent()) break;
                }
            }

            if (usuarioOpt.isPresent()) {
                ReservaAprobacion aprobacion = new ReservaAprobacion();
                aprobacion.setReserva(reserva);
                aprobacion.setUsuario(usuarioOpt.get());
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