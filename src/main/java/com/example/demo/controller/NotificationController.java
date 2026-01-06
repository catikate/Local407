package com.example.demo.controller;

import com.example.demo.dto.NotificationResponse;
import com.example.demo.model.Notification;
import com.example.demo.service.EmailService;
import com.example.demo.service.NotificationService;
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
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private EmailService emailService;

    /**
     * Obtener notificaciones no leídas de un usuario
     * GET /api/notifications/usuario/{usuarioId}/unread
     */
    @GetMapping("/usuario/{usuarioId}/unread")
    public ResponseEntity<List<NotificationResponse>> getUnread(@PathVariable Long usuarioId) {
        List<Notification> notifications = notificationService.getNotificacionesNoLeidas(usuarioId);

        List<NotificationResponse> response = notifications.stream()
            .map(NotificationResponse::from)
            .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    /**
     * Obtener todas las notificaciones de un usuario
     * GET /api/notifications/usuario/{usuarioId}
     */
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<NotificationResponse>> getAll(@PathVariable Long usuarioId) {
        List<Notification> notifications = notificationService.getTodasLasNotificaciones(usuarioId);

        List<NotificationResponse> response = notifications.stream()
            .map(NotificationResponse::from)
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
    public ResponseEntity<NotificationResponse> getById(@PathVariable Long id) {
        // Este endpoint podría implementarse si es necesario
        // Por ahora devolvemos not implemented
        return ResponseEntity.status(501).build();
    }

    /**
     * ENDPOINT DE PRUEBA - Enviar email de prueba
     * POST /api/notifications/test-email
     * Body: { "email": "tu-email@gmail.com" }
     */
    @PostMapping("/test-email")
    public ResponseEntity<Map<String, String>> testEmail(@RequestBody Map<String, String> request) {
        try {
            String emailDestino = request.get("email");

            if (emailDestino == null || emailDestino.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Debes proporcionar un email"));
            }

            emailService.sendEmail(
                emailDestino,
                "🧪 Email de Prueba - Local407",
                "¡Hola!\n\n" +
                "Este es un email de prueba desde Local407.\n\n" +
                "Si estás leyendo esto, significa que la configuración de Gmail está funcionando correctamente. ✅\n\n" +
                "Configuración:\n" +
                "- SMTP: smtp.gmail.com:587\n" +
                "- TLS: Habilitado\n\n" +
                "¡Todo listo para enviar notificaciones!\n\n" +
                "Saludos,\n" +
                "El equipo de Local407"
            );

            return ResponseEntity.ok(Map.of(
                "message", "Email enviado correctamente a: " + emailDestino,
                "status", "success"
            ));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "error", "Error enviando email: " + e.getMessage(),
                "status", "error"
            ));
        }
    }

    /**
     * ENDPOINT DE PRUEBA - Crear notificaciones de prueba
     * POST /api/notifications/test-notifications/{usuarioId}
     */
    @PostMapping("/test-notifications/{usuarioId}")
    public ResponseEntity<Map<String, String>> createTestNotifications(@PathVariable Long usuarioId) {
        try {
            // Buscar el usuario
            com.example.demo.model.Usuario usuario = new com.example.demo.model.Usuario();
            usuario.setId(usuarioId);

            // Crear diferentes tipos de notificaciones
            notificationService.crearNotificacion(
                usuario,
                com.example.demo.model.NotificationType.BOOKING_APPROVED,
                "✅ Reserva Aprobada",
                "Tu reserva para el viernes 10 de enero ha sido aprobada. ¡Disfruta tu ensayo!",
                "/reservas/1",
                com.example.demo.model.NotificationPriority.HIGH,
                false
            );

            notificationService.crearNotificacion(
                usuario,
                com.example.demo.model.NotificationType.PAYMENT_REMINDER,
                "💰 Recordatorio de Pago",
                "Hoy es día 4, fecha de pago de tu cuota mensual. Por favor, realiza el pago correspondiente.",
                "/pagos",
                com.example.demo.model.NotificationPriority.HIGH,
                false
            );

            notificationService.crearNotificacion(
                usuario,
                com.example.demo.model.NotificationType.REHEARSAL_REMINDER,
                "🎸 Ensayo Mañana",
                "Tienes ensayo mañana a las 19:00 con tu banda. ¡No lo olvides!",
                "/reservas/2",
                com.example.demo.model.NotificationPriority.NORMAL,
                false
            );

            notificationService.crearNotificacion(
                usuario,
                com.example.demo.model.NotificationType.ITEM_LOAN_REQUEST,
                "📦 Solicitud de Préstamo",
                "Juan Pérez ha solicitado prestado tu amplificador Marshall para el próximo concierto.",
                "/prestamos/1",
                com.example.demo.model.NotificationPriority.HIGH,
                false
            );

            notificationService.crearNotificacion(
                usuario,
                com.example.demo.model.NotificationType.ITEM_OVERDUE,
                "⚠️ Item No Devuelto",
                "El pedal de efectos que prestaste hace 2 semanas aún no ha sido devuelto.",
                "/prestamos/2",
                com.example.demo.model.NotificationPriority.URGENT,
                false
            );

            return ResponseEntity.ok(Map.of(
                "message", "5 notificaciones de prueba creadas exitosamente",
                "status", "success"
            ));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "error", "Error creando notificaciones: " + e.getMessage(),
                "status", "error"
            ));
        }
    }
}