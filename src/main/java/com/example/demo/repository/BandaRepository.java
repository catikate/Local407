package com.example.demo.repository;

import com.example.demo.model.Banda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BandaRepository extends JpaRepository<Banda, Long> {
    List<Banda> findByLocalId(Long localId);
    List<Banda> findByNombreContainingIgnoreCase(String nombre);
}