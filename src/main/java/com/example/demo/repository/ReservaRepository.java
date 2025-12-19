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

    List<Reserva> findByEstado(ReservaEstado estado);

    @Query("SELECT r FROM Reserva r WHERE r.local.id = :localId AND r.estado IN ('CONFIRMADA', 'APROBADA', 'PENDIENTE_APROBACIONES') " +
           "AND ((r.fechaInicio < :fechaFin AND r.fechaFin > :fechaInicio))")
    List<Reserva> findConflictingReservas(
        @Param("localId") Long localId,
        @Param("fechaInicio") LocalDateTime fechaInicio,
        @Param("fechaFin") LocalDateTime fechaFin
    );

    @Query("SELECT r FROM Reserva r WHERE r.local.id = :localId AND r.id != :reservaId " +
           "AND r.estado IN ('CONFIRMADA', 'APROBADA', 'PENDIENTE_APROBACIONES') " +
           "AND ((r.fechaInicio < :fechaFin AND r.fechaFin > :fechaInicio))")
    List<Reserva> findConflictingReservasExcluding(
        @Param("localId") Long localId,
        @Param("reservaId") Long reservaId,
        @Param("fechaInicio") LocalDateTime fechaInicio,
        @Param("fechaFin") LocalDateTime fechaFin
    );
}