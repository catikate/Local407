package com.example.demo.controller;

import com.example.demo.model.EstadoPrestamo;
import com.example.demo.model.Prestamo;
import com.example.demo.service.PrestamoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prestamos")
public class PrestamoController {

    @Autowired
    private PrestamoService prestamoService;

    @GetMapping
    public ResponseEntity<List<Prestamo>> getAllPrestamos() {
        return ResponseEntity.ok(prestamoService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Prestamo> getPrestamoById(@PathVariable Long id) {
        return prestamoService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/item/{itemId}")
    public ResponseEntity<List<Prestamo>> getPrestamosByItemId(@PathVariable Long itemId) {
        return ResponseEntity.ok(prestamoService.findByItemId(itemId));
    }

    @GetMapping("/prestado-por/{usuarioId}")
    public ResponseEntity<List<Prestamo>> getPrestamosByPrestadoPorId(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(prestamoService.findByPrestadoPorId(usuarioId));
    }

    @GetMapping("/prestado-a-usuario/{usuarioId}")
    public ResponseEntity<List<Prestamo>> getPrestamosByPrestadoAUsuarioId(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(prestamoService.findByPrestadoAUsuarioId(usuarioId));
    }

    @GetMapping("/prestado-a-banda/{bandaId}")
    public ResponseEntity<List<Prestamo>> getPrestamosByPrestadoABandaId(@PathVariable Long bandaId) {
        return ResponseEntity.ok(prestamoService.findByPrestadoABandaId(bandaId));
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<Prestamo>> getPrestamosByEstado(@PathVariable EstadoPrestamo estado) {
        return ResponseEntity.ok(prestamoService.findByEstado(estado));
    }

    @GetMapping("/vencidos")
    public ResponseEntity<List<Prestamo>> getPrestamosVencidos() {
        return ResponseEntity.ok(prestamoService.findVencidos());
    }

    @PostMapping
    public ResponseEntity<?> createPrestamo(@RequestBody Prestamo prestamo) {
        System.out.println("=== CREATE PRESTAMO ENDPOINT REACHED ===");
        System.out.println("Item ID: " + (prestamo.getItem() != null ? prestamo.getItem().getId() : "null"));
        System.out.println("Prestado Por ID: " + (prestamo.getPrestadoPor() != null ? prestamo.getPrestadoPor().getId() : "null"));
        System.out.println("Local Origen ID: " + (prestamo.getLocalOrigen() != null ? prestamo.getLocalOrigen().getId() : "null"));
        System.out.println("Local Destino ID: " + (prestamo.getLocalDestino() != null ? prestamo.getLocalDestino().getId() : "null"));

        try {
            Prestamo savedPrestamo = prestamoService.crearPrestamo(prestamo);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedPrestamo);
        } catch (IllegalStateException | IllegalArgumentException e) {
            System.out.println("Error creating prestamo: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Prestamo> updatePrestamo(@PathVariable Long id, @RequestBody Prestamo prestamo) {
        return prestamoService.findById(id)
                .map(existingPrestamo -> {
                    prestamo.setId(id);
                    Prestamo updated = prestamoService.actualizarPrestamo(existingPrestamo, prestamo);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/devolver")
    public ResponseEntity<?> devolverPrestamo(@PathVariable Long id) {
        try {
            Prestamo prestamo = prestamoService.devolverPrestamo(id);
            return ResponseEntity.ok(prestamo);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/actualizar-vencidos")
    public ResponseEntity<Void> actualizarPrestamosVencidos() {
        prestamoService.actualizarPrestamosVencidos();
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePrestamo(@PathVariable Long id) {
        if (prestamoService.findById(id).isPresent()) {
            prestamoService.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}