package com.example.demo.controller;

import com.example.demo.model.Banda;
import com.example.demo.service.BandaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bandas")
public class BandaController {

    @Autowired
    private BandaService bandaService;

    @GetMapping
    public ResponseEntity<List<Banda>> getAllBandas() {
        return ResponseEntity.ok(bandaService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Banda> getBandaById(@PathVariable Long id) {
        return bandaService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/local/{localId}")
    public ResponseEntity<List<Banda>> getBandasByLocalId(@PathVariable Long localId) {
        return ResponseEntity.ok(bandaService.findByLocalId(localId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Banda>> searchBandasByNombre(@RequestParam String nombre) {
        return ResponseEntity.ok(bandaService.findByNombre(nombre));
    }

    @PostMapping
    public ResponseEntity<Banda> createBanda(@RequestBody Banda banda) {
        Banda savedBanda = bandaService.save(banda);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedBanda);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Banda> updateBanda(@PathVariable Long id, @RequestBody Banda banda) {
        return bandaService.findById(id)
                .map(existingBanda -> {
                    banda.setId(id);
                    return ResponseEntity.ok(bandaService.save(banda));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBanda(@PathVariable Long id) {
        if (bandaService.findById(id).isPresent()) {
            bandaService.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/{bandaId}/miembros/{usuarioId}")
    public ResponseEntity<Banda> addMiembro(@PathVariable Long bandaId, @PathVariable Long usuarioId) {
        Banda banda = bandaService.addMiembro(bandaId, usuarioId);
        if (banda != null) {
            return ResponseEntity.ok(banda);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{bandaId}/miembros/{usuarioId}")
    public ResponseEntity<Banda> removeMiembro(@PathVariable Long bandaId, @PathVariable Long usuarioId) {
        Banda banda = bandaService.removeMiembro(bandaId, usuarioId);
        if (banda != null) {
            return ResponseEntity.ok(banda);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/{bandaId}/unirse/{usuarioId}")
    public ResponseEntity<Banda> unirseABanda(@PathVariable Long bandaId, @PathVariable Long usuarioId) {
        Banda banda = bandaService.unirseABanda(bandaId, usuarioId);
        if (banda != null) {
            return ResponseEntity.ok(banda);
        }
        return ResponseEntity.notFound().build();
    }
}