package com.example.demo.repository;

import com.example.demo.model.ReservaAprobacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReservaAprobacionRepository extends JpaRepository<ReservaAprobacion, Long> {

    List<ReservaAprobacion> findByReservaId(Long reservaId);

    List<ReservaAprobacion> findByUsuarioId(Long usuarioId);

    List<ReservaAprobacion> findByReservaIdAndAprobadaIsNull(Long reservaId);
}