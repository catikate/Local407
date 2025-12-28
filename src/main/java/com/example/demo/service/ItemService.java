package com.example.demo.service;

import com.example.demo.model.Banda;
import com.example.demo.model.Item;
import com.example.demo.model.UsuarioLocal;
import com.example.demo.repository.BandaRepository;
import com.example.demo.repository.ItemRepository;
import com.example.demo.repository.UsuarioLocalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ItemService {

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private UsuarioLocalRepository usuarioLocalRepository;

    @Autowired
    private BandaRepository bandaRepository;

    public List<Item> findAll() {
        return itemRepository.findAll();
    }

    public Optional<Item> findById(Long id) {
        return itemRepository.findById(id);
    }

    public List<Item> findByUsuarioId(Long usuarioId) {
        return itemRepository.findByUsuarioId(usuarioId);
    }

    public List<Item> findByLocalId(Long localId) {
        return itemRepository.findByLocalActualId(localId);
    }

    public List<Item> findByPrestadoAId(Long prestadoAId) {
        return itemRepository.findByPrestadoAId(prestadoAId);
    }

    public List<Item> findByUsuarioLocales(Long usuarioId) {
        java.util.Set<Long> localIds = new java.util.HashSet<>();

        // 1. Agregar locales donde el usuario está directamente (tabla UsuarioLocal)
        List<UsuarioLocal> usuarioLocales = usuarioLocalRepository.findByUsuarioId(usuarioId);
        for (UsuarioLocal ul : usuarioLocales) {
            localIds.add(ul.getLocal().getId());
        }

        // 2. Agregar locales de las bandas del usuario
        List<Banda> bandasDelUsuario = bandaRepository.findAll().stream()
                .filter(banda -> banda.getMiembros() != null &&
                        banda.getMiembros().stream().anyMatch(m -> m.getId().equals(usuarioId)))
                .collect(Collectors.toList());

        for (Banda banda : bandasDelUsuario) {
            if (banda.getLocal() != null) {
                localIds.add(banda.getLocal().getId());
            }
        }

        if (localIds.isEmpty()) {
            return new ArrayList<>();
        }

        // 3. Buscar todos los items que están en esos locales O que tienen su local original en esos locales
        // Esto incluye items prestados a otros locales
        List<Long> localIdsList = new ArrayList<>(localIds);
        return itemRepository.findByLocalActualIdInOrLocalOriginalIdIn(localIdsList);
    }

    public Item save(Item item) {
        return itemRepository.save(item);
    }

    public void deleteById(Long id) {
        itemRepository.deleteById(id);
    }
}