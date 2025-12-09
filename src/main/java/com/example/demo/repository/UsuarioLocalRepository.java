package com.example.demo.repository;

import com.example.demo.model.UsuarioLocal;
import com.example.demo.model.UsuarioLocal.UsuarioLocalId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UsuarioLocalRepository extends JpaRepository<UsuarioLocal, UsuarioLocalId> {
    List<UsuarioLocal> findByUsuarioId(Long usuarioId);
    List<UsuarioLocal> findByLocalId(Long localId);
}