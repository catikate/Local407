package com.example.demo.service;

import com.example.demo.model.Invitacion;
import com.example.demo.model.InvitacionEstado;
import com.example.demo.repository.InvitacionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class InvitacionService {

    @Autowired
    private InvitacionRepository invitacionRepository;

    public List<Invitacion> findAll() {
        return invitacionRepository.findAll();
    }

    public Optional<Invitacion> findById(Long id) {
        return invitacionRepository.findById(id);
    }

    public List<Invitacion> findByDeId(Long deId) {
        return invitacionRepository.findByDeId(deId);
    }

    public List<Invitacion> findByAId(Long aId) {
        return invitacionRepository.findByAId(aId);
    }

    public List<Invitacion> findByLocalId(Long localId) {
        return invitacionRepository.findByLocalId(localId);
    }

    public List<Invitacion> findByEstado(InvitacionEstado estado) {
        return invitacionRepository.findByEstado(estado);
    }

    public Invitacion save(Invitacion invitacion) {
        return invitacionRepository.save(invitacion);
    }

    public void deleteById(Long id) {
        invitacionRepository.deleteById(id);
    }
}