package com.example.demo.service;

import com.example.demo.model.Item;
import com.example.demo.repository.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ItemService {

    @Autowired
    private ItemRepository itemRepository;

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
        return itemRepository.findByLocalId(localId);
    }

    public List<Item> findByPrestadoAId(Long prestadoAId) {
        return itemRepository.findByPrestadoAId(prestadoAId);
    }

    public Item save(Item item) {
        return itemRepository.save(item);
    }

    public void deleteById(Long id) {
        itemRepository.deleteById(id);
    }
}