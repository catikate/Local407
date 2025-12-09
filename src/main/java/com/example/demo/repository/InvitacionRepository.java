package com.example.demo.repository;

import com.example.demo.model.Invitacion;
import com.example.demo.model.InvitacionEstado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvitacionRepository extends JpaRepository<Invitacion, Long> {
    List<Invitacion> findByDeId(Long deId);
    List<Invitacion> findByAId(Long aId);
    List<Invitacion> findByLocalId(Long localId);
    List<Invitacion> findByEstado(InvitacionEstado estado);
}