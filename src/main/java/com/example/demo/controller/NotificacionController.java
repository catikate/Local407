package com.example.demo.controller;

import com.example.demo.dto.NotificacionResponse;
import com.example.demo.model.Notificacion;
import com.example.demo.service.NotificacionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Controller para gestionar notificaciones
 */
@RestController
@RequestMapping("/api/notifications")
public class NotificacionController {

    @Autowired
    private NotificacionService notificationService;

    /**
     * Obtener notificaciones no leídas de un usuario
     * GET /api/notifications/usuario/{usuarioId}/unread
     */
    @GetMapping("/usuario/{usuarioId}/unread")
    public ResponseEntity<List<NotificacionResponse>> getUnread(@PathVariable Long usuarioId) {
        List<Notificacion> notifications = notificationService.getNotificacionesNoLeidas(usuarioId);

        List<NotificacionResponse> response = notifications.stream()
            .map(NotificacionResponse::from)
            .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    /**
     * Obtener todas las notificaciones de un usuario
     * GET /api/notifications/usuario/{usuarioId}
     */
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<NotificacionResponse>> getAll(@PathVariable Long usuarioId) {
        List<Notificacion> notifications = notificationService.getTodasLasNotificaciones(usuarioId);

        List<NotificacionResponse> response = notifications.stream()
            .map(NotificacionResponse::from)
            .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    /**
     * Contar notificaciones no leídas
     * GET /api/notifications/usuario/{usuarioId}/unread/count
     */
    @GetMapping("/usuario/{usuarioId}/unread/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@PathVariable Long usuarioId) {
        long count = notificationService.contarNoLeidas(usuarioId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * Marcar una notificación como leída
     * PATCH /api/notifications/{id}/read?usuarioId={usuarioId}
     */
    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(
        @PathVariable Long id,
        @RequestParam Long usuarioId
    ) {
        notificationService.marcarComoLeida(id, usuarioId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Marcar todas las notificaciones como leídas
     * PATCH /api/notifications/usuario/{usuarioId}/read-all
     */
    @PatchMapping("/usuario/{usuarioId}/read-all")
    public ResponseEntity<Void> markAllAsRead(@PathVariable Long usuarioId) {
        notificationService.marcarTodasComoLeidas(usuarioId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Eliminar una notificación
     * DELETE /api/notifications/{id}?usuarioId={usuarioId}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(
        @PathVariable Long id,
        @RequestParam Long usuarioId
    ) {
        notificationService.eliminarNotificacion(id, usuarioId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Obtener notificación por ID
     * GET /api/notifications/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<NotificacionResponse> getById(@PathVariable Long id) {
        // Este endpoint podría implementarse si es necesario
        // Por ahora devolvemos not implemented
        return ResponseEntity.status(501).build();
    }
}