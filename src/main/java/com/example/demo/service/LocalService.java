package com.example.demo.service;

import com.example.demo.model.Local;
import com.example.demo.model.Usuario;
import com.example.demo.model.UsuarioLocal;
import com.example.demo.repository.LocalRepository;
import com.example.demo.repository.UsuarioRepository;
import com.example.demo.repository.UsuarioLocalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LocalService {

    @Autowired
    private LocalRepository localRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private UsuarioLocalRepository usuarioLocalRepository;

    public List<Local> findAll() {
        return localRepository.findAll();
    }

    public Optional<Local> findById(Long id) {
        return localRepository.findById(id);
    }

    public List<Local> findByAdminId(Long adminId) {
        return localRepository.findByAdminId(adminId);
    }

    public Local save(Local local) {
        return localRepository.save(local);
    }

    public void deleteById(Long id) {
        localRepository.deleteById(id);
    }

    public Local addUsuario(Long localId, Long usuarioId) {
        Optional<Local> localOpt = localRepository.findById(localId);
        Optional<Usuario> usuarioOpt = usuarioRepository.findById(usuarioId);

        if (localOpt.isPresent() && usuarioOpt.isPresent()) {
            Local local = localOpt.get();
            Usuario usuario = usuarioOpt.get();

            UsuarioLocal usuarioLocal = new UsuarioLocal(usuario, local);
            usuarioLocalRepository.save(usuarioLocal);

            return localRepository.findById(localId).orElse(null);
        }
        return null;
    }

    public Local removeUsuario(Long localId, Long usuarioId) {
        UsuarioLocal.UsuarioLocalId id = new UsuarioLocal.UsuarioLocalId(usuarioId, localId);
        usuarioLocalRepository.deleteById(id);
        return localRepository.findById(localId).orElse(null);
    }
}