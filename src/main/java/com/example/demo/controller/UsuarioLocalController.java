package com.example.demo.controller;

import com.example.demo.model.UsuarioLocal;
import com.example.demo.model.UsuarioLocal.UsuarioLocalId;
import com.example.demo.service.UsuarioLocalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuario-locales")
public class UsuarioLocalController {

    @Autowired
    private UsuarioLocalService usuarioLocalService;

    @GetMapping
    public ResponseEntity<List<UsuarioLocal>> getAllUsuarioLocales() {
        return ResponseEntity.ok(usuarioLocalService.findAll());
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<UsuarioLocal>> getUsuarioLocalesByUsuarioId(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(usuarioLocalService.findByUsuarioId(usuarioId));
    }

    @GetMapping("/local/{localId}")
    public ResponseEntity<List<UsuarioLocal>> getUsuarioLocalesByLocalId(@PathVariable Long localId) {
        return ResponseEntity.ok(usuarioLocalService.findByLocalId(localId));
    }

    @PostMapping
    public ResponseEntity<UsuarioLocal> createUsuarioLocal(@RequestBody UsuarioLocal usuarioLocal) {
        UsuarioLocal savedUsuarioLocal = usuarioLocalService.save(usuarioLocal);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedUsuarioLocal);
    }

    @DeleteMapping("/usuario/{usuarioId}/local/{localId}")
    public ResponseEntity<Void> deleteUsuarioLocal(@PathVariable Long usuarioId, @PathVariable Long localId) {
        UsuarioLocalId id = new UsuarioLocalId(usuarioId, localId);
        if (usuarioLocalService.findById(id).isPresent()) {
            usuarioLocalService.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}