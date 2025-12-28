package com.example.demo.repository;

import com.example.demo.model.EstadoPrestamo;
import com.example.demo.model.Prestamo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PrestamoRepository extends JpaRepository<Prestamo, Long> {

    List<Prestamo> findByItemId(Long itemId);

    List<Prestamo> findByPrestadoPorId(Long usuarioId);

    List<Prestamo> findByPrestadoAUsuarioId(Long usuarioId);

    List<Prestamo> findByPrestadoABandaId(Long bandaId);

    List<Prestamo> findByEstado(EstadoPrestamo estado);

    List<Prestamo> findByLocalOrigenId(Long localId);

    List<Prestamo> findByLocalDestinoId(Long localId);

    @Query("SELECT p FROM Prestamo p WHERE p.estado = :estado AND p.fechaDevolucionEsperada < :fecha")
    List<Prestamo> findVencidos(@Param("estado") EstadoPrestamo estado, @Param("fecha") LocalDateTime fecha);

    @Query("SELECT p FROM Prestamo p WHERE p.prestadoAUsuario.id = :usuarioId AND p.estado = 'ACTIVO'")
    List<Prestamo> findPrestamosActivosDeUsuario(@Param("usuarioId") Long usuarioId);

    @Query("SELECT p FROM Prestamo p WHERE p.prestadoABanda.id = :bandaId AND p.estado = 'ACTIVO'")
    List<Prestamo> findPrestamosActivosDeBanda(@Param("bandaId") Long bandaId);
}