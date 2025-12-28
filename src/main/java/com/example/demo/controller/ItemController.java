package com.example.demo.controller;

import com.example.demo.model.Item;
import com.example.demo.service.ItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/items")
public class ItemController {

    @Autowired
    private ItemService itemService;

    @GetMapping
    public ResponseEntity<List<Item>> getAllItems() {
        return ResponseEntity.ok(itemService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Item> getItemById(@PathVariable Long id) {
        return itemService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Item>> getItemsByUsuarioId(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(itemService.findByUsuarioId(usuarioId));
    }

    @GetMapping("/local/{localId}")
    public ResponseEntity<List<Item>> getItemsByLocalId(@PathVariable Long localId) {
        return ResponseEntity.ok(itemService.findByLocalId(localId));
    }

    @GetMapping("/prestado/{prestadoAId}")
    public ResponseEntity<List<Item>> getItemsByPrestadoAId(@PathVariable Long prestadoAId) {
        return ResponseEntity.ok(itemService.findByPrestadoAId(prestadoAId));
    }

    @GetMapping("/usuario/{usuarioId}/locales")
    public ResponseEntity<List<Item>> getItemsByUsuarioLocales(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(itemService.findByUsuarioLocales(usuarioId));
    }

    @PostMapping
    public ResponseEntity<Item> createItem(@RequestBody Item item) {
        System.out.println("=== CREATE ITEM REQUEST ===");
        System.out.println("Item: " + item);
        System.out.println("Propietario Usuario: " + item.getPropietarioUsuario());
        System.out.println("Propietario Banda: " + item.getPropietarioBanda());
        System.out.println("Local Original: " + item.getLocalOriginal());
        System.out.println("Local Actual: " + item.getLocalActual());
        Item savedItem = itemService.save(item);
        System.out.println("Item saved successfully with ID: " + savedItem.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(savedItem);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Item> updateItem(@PathVariable Long id, @RequestBody Item item) {
        return itemService.findById(id)
                .map(existingItem -> {
                    item.setId(id);
                    return ResponseEntity.ok(itemService.save(item));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        if (itemService.findById(id).isPresent()) {
            itemService.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}