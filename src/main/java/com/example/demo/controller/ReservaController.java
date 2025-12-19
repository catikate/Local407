package com.example.demo.controller;

import com.example.demo.model.Reserva;
import com.example.demo.model.ReservaAprobacion;
import com.example.demo.model.ReservaEstado;
import com.example.demo.service.ReservaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/reservas")
public class ReservaController {

    @Autowired
    private ReservaService reservaService;

    @GetMapping
    public List<Reserva> getAllReservas() {
        return reservaService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Reserva> getReservaById(@PathVariable Long id) {
        Optional<Reserva> reserva = reservaService.findById(id);
        return reserva.map(ResponseEntity::ok)
                      .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/usuario/{usuarioId}")
    public List<Reserva> getReservasByUsuario(@PathVariable Long usuarioId) {
        return reservaService.findByUsuarioId(usuarioId);
    }

    @GetMapping("/local/{localId}")
    public List<Reserva> getReservasByLocal(@PathVariable Long localId) {
        return reservaService.findByLocalId(localId);
    }

    @GetMapping("/estado/{estado}")
    public List<Reserva> getReservasByEstado(@PathVariable ReservaEstado estado) {
        return reservaService.findByEstado(estado);
    }

    @PostMapping
    public ResponseEntity<?> createReserva(@RequestBody Reserva reserva) {
        try {
            Reserva nuevaReserva = reservaService.save(reserva);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevaReserva);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateReserva(@PathVariable Long id, @RequestBody Reserva reserva) {
        if (!reservaService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        try {
            reserva.setId(id);
            Reserva reservaActualizada = reservaService.save(reserva);
            return ResponseEntity.ok(reservaActualizada);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReserva(@PathVariable Long id) {
        if (!reservaService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        reservaService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/aprobaciones")
    public List<ReservaAprobacion> getAprobacionesByReserva(@PathVariable Long id) {
        return reservaService.findAprobacionesByReservaId(id);
    }

    @GetMapping("/aprobaciones/pendientes/usuario/{usuarioId}")
    public List<ReservaAprobacion> getAprobacionesPendientesByUsuario(@PathVariable Long usuarioId) {
        return reservaService.findAprobacionesPendientesByUsuarioId(usuarioId);
    }

    @PutMapping("/aprobaciones/{aprobacionId}")
    public ResponseEntity<?> responderAprobacion(
            @PathVariable Long aprobacionId,
            @RequestBody Map<String, Boolean> body) {
        try {
            Boolean aprobada = body.get("aprobada");
            if (aprobada == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "El campo 'aprobada' es requerido"));
            }
            reservaService.responderAprobacion(aprobacionId, aprobada);
            return ResponseEntity.ok(Map.of("mensaje", "Respuesta registrada"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}