package com.example.demo.controller;

import com.example.demo.model.Invitacion;
import com.example.demo.model.InvitacionEstado;
import com.example.demo.service.InvitacionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invitaciones")
public class InvitacionController {

    @Autowired
    private InvitacionService invitacionService;

    @GetMapping
    public ResponseEntity<List<Invitacion>> getAllInvitaciones() {
        return ResponseEntity.ok(invitacionService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Invitacion> getInvitacionById(@PathVariable Long id) {
        return invitacionService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/enviadas/{deId}")
    public ResponseEntity<List<Invitacion>> getInvitacionesEnviadas(@PathVariable Long deId) {
        return ResponseEntity.ok(invitacionService.findByDeId(deId));
    }

    @GetMapping("/recibidas/{aId}")
    public ResponseEntity<List<Invitacion>> getInvitacionesRecibidas(@PathVariable Long aId) {
        return ResponseEntity.ok(invitacionService.findByAId(aId));
    }

    @GetMapping("/local/{localId}")
    public ResponseEntity<List<Invitacion>> getInvitacionesByLocalId(@PathVariable Long localId) {
        return ResponseEntity.ok(invitacionService.findByLocalId(localId));
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<Invitacion>> getInvitacionesByEstado(@PathVariable InvitacionEstado estado) {
        return ResponseEntity.ok(invitacionService.findByEstado(estado));
    }

    @PostMapping
    public ResponseEntity<Invitacion> createInvitacion(@RequestBody Invitacion invitacion) {
        Invitacion savedInvitacion = invitacionService.save(invitacion);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedInvitacion);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Invitacion> updateInvitacion(@PathVariable Long id, @RequestBody Invitacion invitacion) {
        return invitacionService.findById(id)
                .map(existingInvitacion -> {
                    invitacion.setId(id);
                    return ResponseEntity.ok(invitacionService.save(invitacion));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInvitacion(@PathVariable Long id) {
        if (invitacionService.findById(id).isPresent()) {
            invitacionService.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}