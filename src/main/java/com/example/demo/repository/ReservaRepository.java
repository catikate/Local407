package com.example.demo.repository;

import com.example.demo.model.Reserva;
import com.example.demo.model.ReservaEstado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    List<Reserva> findByUsuarioId(Long usuarioId);

    List<Reserva> findByLocalId(Long localId);

    List<Reserva> findByBandaId(Long bandaId);

    List<Reserva> findByEstado(ReservaEstado estado);

    @Query("SELECT r FROM Reserva r WHERE r.local.id = :localId " +
           "AND r.tipoEvento = 'ENSAYO' " +
           "AND r.estado IN ('CONFIRMADA', 'APROBADA', 'PENDIENTE_APROBACIONES') " +
           "AND ((r.fechaInicio < :fechaFin AND r.fechaFin > :fechaInicio))")
    List<Reserva> findConflictingReservas(
        @Param("localId") Long localId,
        @Param("fechaInicio") LocalDateTime fechaInicio,
        @Param("fechaFin") LocalDateTime fechaFin
    );

    @Query("SELECT r FROM Reserva r WHERE r.local.id = :localId AND r.id != :reservaId " +
           "AND r.tipoEvento = 'ENSAYO' " +
           "AND r.estado IN ('CONFIRMADA', 'APROBADA', 'PENDIENTE_APROBACIONES') " +
           "AND ((r.fechaInicio < :fechaFin AND r.fechaFin > :fechaInicio))")
    List<Reserva> findConflictingReservasExcluding(
        @Param("localId") Long localId,
        @Param("reservaId") Long reservaId,
        @Param("fechaInicio") LocalDateTime fechaInicio,
        @Param("fechaFin") LocalDateTime fechaFin
    );

    @Query("SELECT r FROM Reserva r WHERE r.banda.id = :bandaId " +
           "AND r.tipoEvento = 'SHOW' " +
           "AND r.estado IN ('CONFIRMADA', 'APROBADA') " +
           "AND ((r.fechaInicio < :fechaFin AND r.fechaFin > :fechaInicio))")
    List<Reserva> findConflictingShowsForBanda(
        @Param("bandaId") Long bandaId,
        @Param("fechaInicio") LocalDateTime fechaInicio,
        @Param("fechaFin") LocalDateTime fechaFin
    );

    @Query("SELECT r FROM Reserva r WHERE r.usuario.id = :usuarioId " +
           "AND r.tipoEvento = 'SHOW_PERSONAL' " +
           "AND r.estado IN ('CONFIRMADA', 'APROBADA') " +
           "AND ((r.fechaInicio < :fechaFin AND r.fechaFin > :fechaInicio))")
    List<Reserva> findConflictingPersonalShows(
        @Param("usuarioId") Long usuarioId,
        @Param("fechaInicio") LocalDateTime fechaInicio,
        @Param("fechaFin") LocalDateTime fechaFin
    );

    @Query("SELECT DISTINCT r FROM Reserva r " +
           "LEFT JOIN r.local l " +
           "LEFT JOIN l.usuarioLocales ul " +
           "WHERE (" +
           "  r.usuario.id = :usuarioId OR " +
           "  r.banda.id IN (SELECT b.id FROM Banda b JOIN b.miembros m WHERE m.id = :usuarioId) OR " +
           "  ul.usuario.id = :usuarioId" +
           ") " +
           "AND ((r.fechaInicio >= :startDate AND r.fechaInicio < :endDate) OR " +
           "     (r.fechaFin > :startDate AND r.fechaFin <= :endDate) OR " +
           "     (r.fechaInicio < :startDate AND r.fechaFin > :endDate)) " +
           "ORDER BY r.fechaInicio ASC")
    List<Reserva> findByUsuarioAndMonth(
        @Param("usuarioId") Long usuarioId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
}