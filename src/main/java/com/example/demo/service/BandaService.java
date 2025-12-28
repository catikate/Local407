package com.example.demo.service;

import com.example.demo.model.Banda;
import com.example.demo.model.Usuario;
import com.example.demo.model.UsuarioLocal;
import com.example.demo.repository.BandaRepository;
import com.example.demo.repository.UsuarioRepository;
import com.example.demo.repository.UsuarioLocalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BandaService {

    @Autowired
    private BandaRepository bandaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private UsuarioLocalRepository usuarioLocalRepository;

    public List<Banda> findAll() {
        return bandaRepository.findAll();
    }

    public Optional<Banda> findById(Long id) {
        return bandaRepository.findById(id);
    }

    public List<Banda> findByLocalId(Long localId) {
        return bandaRepository.findByLocalId(localId);
    }

    public List<Banda> findByNombre(String nombre) {
        return bandaRepository.findByNombreContainingIgnoreCase(nombre);
    }

    public Banda save(Banda banda) {
        return bandaRepository.save(banda);
    }

    public void deleteById(Long id) {
        bandaRepository.deleteById(id);
    }

    public Banda addMiembro(Long bandaId, Long usuarioId) {
        Optional<Banda> bandaOpt = bandaRepository.findById(bandaId);
        Optional<Usuario> usuarioOpt = usuarioRepository.findById(usuarioId);

        if (bandaOpt.isPresent() && usuarioOpt.isPresent()) {
            Banda banda = bandaOpt.get();
            Usuario usuario = usuarioOpt.get();
            banda.getMiembros().add(usuario);
            return bandaRepository.save(banda);
        }
        return null;
    }

    public Banda removeMiembro(Long bandaId, Long usuarioId) {
        Optional<Banda> bandaOpt = bandaRepository.findById(bandaId);
        Optional<Usuario> usuarioOpt = usuarioRepository.findById(usuarioId);

        if (bandaOpt.isPresent() && usuarioOpt.isPresent()) {
            Banda banda = bandaOpt.get();
            Usuario usuario = usuarioOpt.get();
            banda.getMiembros().remove(usuario);
            return bandaRepository.save(banda);
        }
        return null;
    }

    public Banda unirseABanda(Long bandaId, Long usuarioId) {
        Optional<Banda> bandaOpt = bandaRepository.findById(bandaId);
        Optional<Usuario> usuarioOpt = usuarioRepository.findById(usuarioId);

        if (bandaOpt.isPresent() && usuarioOpt.isPresent()) {
            Banda banda = bandaOpt.get();
            Usuario usuario = usuarioOpt.get();

            // Agregar usuario a la banda
            banda.getMiembros().add(usuario);
            bandaRepository.save(banda);

            // Agregar usuario al local de la banda automáticamente
            if (banda.getLocal() != null) {
                UsuarioLocal usuarioLocal = new UsuarioLocal(usuario, banda.getLocal());
                usuarioLocalRepository.save(usuarioLocal);
            }

            return banda;
        }
        return null;
    }
}