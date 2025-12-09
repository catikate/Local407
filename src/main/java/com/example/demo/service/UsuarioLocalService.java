package com.example.demo.service;

import com.example.demo.model.UsuarioLocal;
import com.example.demo.model.UsuarioLocal.UsuarioLocalId;
import com.example.demo.repository.UsuarioLocalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UsuarioLocalService {

    @Autowired
    private UsuarioLocalRepository usuarioLocalRepository;

    public List<UsuarioLocal> findAll() {
        return usuarioLocalRepository.findAll();
    }

    public Optional<UsuarioLocal> findById(UsuarioLocalId id) {
        return usuarioLocalRepository.findById(id);
    }

    public List<UsuarioLocal> findByUsuarioId(Long usuarioId) {
        return usuarioLocalRepository.findByUsuarioId(usuarioId);
    }

    public List<UsuarioLocal> findByLocalId(Long localId) {
        return usuarioLocalRepository.findByLocalId(localId);
    }

    public UsuarioLocal save(UsuarioLocal usuarioLocal) {
        return usuarioLocalRepository.save(usuarioLocal);
    }

    public void deleteById(UsuarioLocalId id) {
        usuarioLocalRepository.deleteById(id);
    }
}