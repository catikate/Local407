package com.example.demo.controller;

import com.example.demo.model.Local;
import com.example.demo.service.LocalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/locales")
public class LocalController {

    @Autowired
    private LocalService localService;

    @GetMapping
    public ResponseEntity<List<Local>> getAllLocales() {
        return ResponseEntity.ok(localService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Local> getLocalById(@PathVariable Long id) {
        return localService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/admin/{adminId}")
    public ResponseEntity<List<Local>> getLocalesByAdminId(@PathVariable Long adminId) {
        return ResponseEntity.ok(localService.findByAdminId(adminId));
    }

    @PostMapping
    public ResponseEntity<Local> createLocal(@RequestBody Local local) {
        Local savedLocal = localService.save(local);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedLocal);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Local> updateLocal(@PathVariable Long id, @RequestBody Local local) {
        return localService.findById(id)
                .map(existingLocal -> {
                    local.setId(id);
                    return ResponseEntity.ok(localService.save(local));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLocal(@PathVariable Long id) {
        if (localService.findById(id).isPresent()) {
            localService.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/{localId}/usuarios/{usuarioId}")
    public ResponseEntity<Local> addUsuario(@PathVariable Long localId, @PathVariable Long usuarioId) {
        Local local = localService.addUsuario(localId, usuarioId);
        if (local != null) {
            return ResponseEntity.ok(local);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{localId}/usuarios/{usuarioId}")
    public ResponseEntity<Local> removeUsuario(@PathVariable Long localId, @PathVariable Long usuarioId) {
        Local local = localService.removeUsuario(localId, usuarioId);
        if (local != null) {
            return ResponseEntity.ok(local);
        }
        return ResponseEntity.notFound().build();
    }
}