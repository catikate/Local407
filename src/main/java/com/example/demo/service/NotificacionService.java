package com.example.demo.service;

import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.exception.UnauthorizedException;
import com.example.demo.model.*;
import com.example.demo.repository.NotificacionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Servicio para gestionar notificaciones
 */
@Service
@Transactional
public class NotificacionService {

    private static final Logger log = LoggerFactory.getLogger(NotificacionService.class);

    @Autowired
    private NotificacionRepository notificationRepository;

    @Autowired
    private EmailService emailService;

    /**
     * Crear notificación (in-app + email opcional)
     */
    public Notificacion crearNotificacion(
        Usuario usuario,
        TipoNotificacion type,
        String title,
        String message,
        String actionUrl,
        PrioridadNotificacion priority,
        boolean sendEmail
    ) {
        // Crear notificación in-app
        Notificacion notification = new Notificacion();
        notification.setUsuario(usuario);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setActionUrl(actionUrl);
        notification.setPriority(priority);
        notification.setIsRead(false);

        notification = notificationRepository.save(notification);
        log.info("Notificación creada: {} para usuario {}", type, usuario.getId());

        // Enviar email si se solicita
        if (sendEmail && usuario.getEmail() != null) {
            try {
                emailService.sendEmail(
                    usuario.getEmail(),
                    title,
                    message
                );
                notification.setEmailSent(true);
                notificationRepository.save(notification);
                log.info("Email enviado a {}", usuario.getEmail());
            } catch (Exception e) {
                log.error("Error enviando email de notificación: {}", e.getMessage());
                // No lanzar excepción, la notificación in-app ya se creó
            }
        }

        return notification;
    }

    /**
     * Notificar nueva reserva creada
     */
    public void notificarReservaCreada(Reserva reserva, Usuario creador) {
        // Notificar a todos los miembros de la banda excepto al creador
        for (Usuario miembro : reserva.getBanda().getMiembros()) {
            if (!miembro.getId().equals(creador.getId())) {
                crearNotificacion(
                    miembro,
                    TipoNotificacion.BOOKING_CREATED,
                    "Nueva reserva creada",
                    String.format("%s %s creó una reserva para %s el %s",
                        creador.getNombre(),
                        creador.getApellido(),
                        reserva.getBanda().getNombre(),
                        reserva.getFechaInicio().toLocalDate()
                    ),
                    "/reservas/" + reserva.getId(),
                    PrioridadNotificacion.NORMAL,
                    false
                );
            }
        }
    }

    /**
     * Notificar reserva pendiente de aprobación
     */
    public void notificarReservaPendiente(Reserva reserva) {
        System.out.println("DEBUG NotificacionService: notificarReservaPendiente called");
        System.out.println("DEBUG: Reserva ID: " + reserva.getId());
        System.out.println("DEBUG: Banda: " + (reserva.getBanda() != null ? reserva.getBanda().getNombre() : "NULL"));

        // Notificar a todos los miembros de la banda
        if (reserva.getBanda() == null) {
            log.warn("No se pueden crear notificaciones: la reserva no tiene banda asignada");
            return;
        }

        if (reserva.getBanda().getMiembros() == null || reserva.getBanda().getMiembros().isEmpty()) {
            log.warn("No se pueden crear notificaciones: la banda no tiene miembros");
            return;
        }

        System.out.println("DEBUG: Creando notificaciones para " + reserva.getBanda().getMiembros().size() + " miembros");

        for (Usuario miembro : reserva.getBanda().getMiembros()) {
            System.out.println("DEBUG: Creando notificación para usuario: " + miembro.getNombre() + " " + miembro.getApellido() + " (ID: " + miembro.getId() + ")");
            crearNotificacion(
                miembro,
                TipoNotificacion.BOOKING_PENDING_APPROVAL,
                "Nueva reserva pendiente",
                String.format("Hay una nueva reserva para %s el %s que requiere aprobación",
                    reserva.getBanda().getNombre(),
                    reserva.getFechaInicio().toLocalDate()
                ),
                "/reservas/" + reserva.getId(),
                PrioridadNotificacion.HIGH,
                true
            );
        }
        System.out.println("DEBUG: Todas las notificaciones creadas");
    }

    /**
     * Notificar reserva aprobada
     */
    public void notificarReservaAprobada(Reserva reserva) {
        for (Usuario miembro : reserva.getBanda().getMiembros()) {
            try {
                crearNotificacion(
                    miembro,
                    TipoNotificacion.BOOKING_APPROVED,
                    "✅ Reserva Aprobada",
                    String.format("La reserva de %s para el %s ha sido aprobada",
                        reserva.getBanda().getNombre(),
                        reserva.getFechaInicio().toLocalDate()
                    ),
                    "/reservas/" + reserva.getId(),
                    PrioridadNotificacion.HIGH,
                    false
                );

                // Enviar email específico
                emailService.enviarReservaAprobada(miembro, reserva);

            } catch (Exception e) {
                log.error("Error notificando reserva aprobada: {}", e.getMessage());
            }
        }
    }

    /**
     * Notificar reserva rechazada
     */
    public void notificarReservaRechazada(Reserva reserva, String razon) {
        for (Usuario miembro : reserva.getBanda().getMiembros()) {
            try {
                crearNotificacion(
                    miembro,
                    TipoNotificacion.BOOKING_REJECTED,
                    "❌ Reserva Rechazada",
                    String.format("La reserva de %s para el %s ha sido rechazada. Razón: %s",
                        reserva.getBanda().getNombre(),
                        reserva.getFechaInicio().toLocalDate(),
                        razon != null ? razon : "No especificada"
                    ),
                    "/reservas/" + reserva.getId(),
                    PrioridadNotificacion.HIGH,
                    false
                );

                // Enviar email específico
                emailService.enviarReservaRechazada(miembro, reserva, razon);

            } catch (Exception e) {
                log.error("Error notificando reserva rechazada: {}", e.getMessage());
            }
        }
    }

    /**
     * Notificar reserva cancelada
     */
    public void notificarReservaCancelada(Reserva reserva, Usuario canceladoPor) {
        for (Usuario miembro : reserva.getBanda().getMiembros()) {
            if (!miembro.getId().equals(canceladoPor.getId())) {
                crearNotificacion(
                    miembro,
                    TipoNotificacion.BOOKING_CANCELLED,
                    "Reserva Cancelada",
                    String.format("%s canceló la reserva de %s del %s",
                        canceladoPor.getNombre(),
                        reserva.getBanda().getNombre(),
                        reserva.getFechaInicio().toLocalDate()
                    ),
                    "/reservas",
                    PrioridadNotificacion.NORMAL,
                    true
                );
            }
        }
    }

    /**
     * Notificar solicitud de préstamo de item
     */
    public void notificarSolicitudPrestamo(Prestamo prestamo) {
        System.out.println("DEBUG: notificarSolicitudPrestamo called");
        System.out.println("DEBUG: Prestamo ID: " + prestamo.getId());
        System.out.println("DEBUG: Item: " + prestamo.getItem().getDescripcion());
        System.out.println("DEBUG: prestadoPor (borrower): " + prestamo.getPrestadoPor().getNombre() + " " + prestamo.getPrestadoPor().getApellido() + " (ID: " + prestamo.getPrestadoPor().getId() + ")");

        Usuario propietario = prestamo.getItem().getPropietarioUsuario();
        System.out.println("DEBUG: Item propietarioUsuario (owner): " + (propietario != null ? propietario.getNombre() + " " + propietario.getApellido() + " (ID: " + propietario.getId() + ")" : "NULL"));

        if (prestamo.getPrestadoAUsuario() != null) {
            System.out.println("DEBUG: prestadoAUsuario (recipient): " + prestamo.getPrestadoAUsuario().getNombre() + " " + prestamo.getPrestadoAUsuario().getApellido() + " (ID: " + prestamo.getPrestadoAUsuario().getId() + ")");
        }

        if (propietario == null) {
            log.warn("Cannot create notification: item has no owner");
            return;
        }

        try {
            System.out.println("DEBUG: Creating notification for owner: " + propietario.getNombre() + " (ID: " + propietario.getId() + ")");

            crearNotificacion(
                propietario,
                TipoNotificacion.ITEM_LOAN_REQUEST,
                "📦 Solicitud de Préstamo",
                String.format("%s solicita prestado: %s",
                    prestamo.getPrestadoPor().getNombre(),
                    prestamo.getItem().getDescripcion()
                ),
                "/prestamos/" + prestamo.getId(),
                PrioridadNotificacion.HIGH,
                false
            );

            System.out.println("DEBUG: Notificacion created successfully");

            // Enviar email específico
            emailService.enviarSolicitudPrestamo(
                propietario,
                prestamo.getPrestadoPor(),
                prestamo.getItem(),
                prestamo
            );

        } catch (Exception e) {
            log.error("Error notificando solicitud de préstamo: {}", e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Notificar préstamo aprobado
     */
    public void notificarPrestamoAprobado(Prestamo prestamo) {
        Usuario solicitante = prestamo.getPrestadoPor();

        crearNotificacion(
            solicitante,
            TipoNotificacion.ITEM_LOAN_APPROVED,
            "✅ Préstamo Aprobado",
            String.format("Tu solicitud de préstamo de '%s' ha sido aprobada",
                prestamo.getItem().getDescripcion()
            ),
            "/prestamos/" + prestamo.getId(),
            PrioridadNotificacion.NORMAL,
            true
        );
    }

    /**
     * Notificar préstamo rechazado
     */
    public void notificarPrestamoRechazado(Prestamo prestamo) {
        Usuario solicitante = prestamo.getPrestadoPor();

        crearNotificacion(
            solicitante,
            TipoNotificacion.ITEM_LOAN_REJECTED,
            "❌ Préstamo Rechazado",
            String.format("Tu solicitud de préstamo de '%s' ha sido rechazada",
                prestamo.getItem().getDescripcion()
            ),
            "/prestamos/" + prestamo.getId(),
            PrioridadNotificacion.NORMAL,
            true
        );
    }

    /**
     * Notificar item vencido
     */
    public void notificarItemVencido(Prestamo prestamo) {
        Usuario propietario = prestamo.getItem().getPropietarioUsuario();
        if (propietario == null) return;

        try {
            crearNotificacion(
                propietario,
                TipoNotificacion.ITEM_OVERDUE,
                "⚠️ Item No Devuelto",
                String.format("El item '%s' prestado a %s NO ha sido devuelto",
                    prestamo.getItem().getDescripcion(),
                    prestamo.getReceptorNombre()
                ),
                "/prestamos/" + prestamo.getId(),
                PrioridadNotificacion.URGENT,
                false
            );

            // Enviar email específico
            emailService.enviarNotificacionItemVencido(propietario, prestamo);

        } catch (Exception e) {
            log.error("Error notificando item vencido: {}", e.getMessage());
        }
    }

    /**
     * Notificar nuevo miembro añadido a banda
     */
    public void notificarMiembroAñadido(Banda banda, Usuario nuevoMiembro, Usuario añadidoPor) {
        // Notificar al nuevo miembro
        crearNotificacion(
            nuevoMiembro,
            TipoNotificacion.MEMBER_ADDED,
            "🎵 Te añadieron a una banda",
            String.format("%s te añadió a la banda %s",
                añadidoPor.getNombre(),
                banda.getNombre()
            ),
            "/bandas/" + banda.getId(),
            PrioridadNotificacion.HIGH,
            true
        );

        // Notificar a los demás miembros
        for (Usuario miembro : banda.getMiembros()) {
            if (!miembro.getId().equals(nuevoMiembro.getId()) &&
                !miembro.getId().equals(añadidoPor.getId())) {

                crearNotificacion(
                    miembro,
                    TipoNotificacion.MEMBER_ADDED,
                    "Nuevo miembro en la banda",
                    String.format("%s añadió a %s a la banda %s",
                        añadidoPor.getNombre(),
                        nuevoMiembro.getNombre(),
                        banda.getNombre()
                    ),
                    "/bandas/" + banda.getId(),
                    PrioridadNotificacion.LOW,
                    false
                );
            }
        }
    }

    /**
     * Notificar miembro eliminado de banda
     */
    public void notificarMiembroEliminado(Banda banda, Usuario miembroEliminado, Usuario eliminadoPor) {
        // Notificar al miembro eliminado
        crearNotificacion(
            miembroEliminado,
            TipoNotificacion.MEMBER_REMOVED,
            "Te eliminaron de una banda",
            String.format("%s te eliminó de la banda %s",
                eliminadoPor.getNombre(),
                banda.getNombre()
            ),
            "/bandas",
            PrioridadNotificacion.HIGH,
            true
        );
    }

    /**
     * Notificar cambio de local de banda
     */
    public void notificarCambioLocal(Banda banda, Local localAnterior, Local localNuevo) {
        for (Usuario miembro : banda.getMiembros()) {
            crearNotificacion(
                miembro,
                TipoNotificacion.LOCAL_CHANGED,
                "Cambio de local de banda",
                String.format("La banda %s cambió de local: %s → %s",
                    banda.getNombre(),
                    localAnterior.getNombre(),
                    localNuevo.getNombre()
                ),
                "/bandas/" + banda.getId(),
                PrioridadNotificacion.NORMAL,
                true
            );
        }
    }

    /**
     * Marcar como leída
     */
    public void marcarComoLeida(Long notificationId, Long usuarioId) {
        Notificacion notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new ResourceNotFoundException("Notificación no encontrada"));

        // Verificar que pertenece al usuario
        if (!notification.getUsuario().getId().equals(usuarioId)) {
            throw new UnauthorizedException("No autorizado");
        }

        notification.setIsRead(true);
        notification.setReadAt(LocalDateTime.now());
        notificationRepository.save(notification);

        log.info("Notificación {} marcada como leída por usuario {}", notificationId, usuarioId);
    }

    /**
     * Marcar todas como leídas
     */
    public void marcarTodasComoLeidas(Long usuarioId) {
        List<Notificacion> notifications =
            notificationRepository.findByUsuarioIdAndIsReadFalseOrderByCreatedAtDesc(usuarioId);

        for (Notificacion n : notifications) {
            n.setIsRead(true);
            n.setReadAt(LocalDateTime.now());
        }

        notificationRepository.saveAll(notifications);
        log.info("Todas las notificaciones marcadas como leídas para usuario {}", usuarioId);
    }

    /**
     * Obtener notificaciones no leídas
     */
    public List<Notificacion> getNotificacionesNoLeidas(Long usuarioId) {
        return notificationRepository.findByUsuarioIdAndIsReadFalseOrderByCreatedAtDesc(usuarioId);
    }

    /**
     * Obtener todas las notificaciones
     */
    public List<Notificacion> getTodasLasNotificaciones(Long usuarioId) {
        return notificationRepository.findByUsuarioIdOrderByCreatedAtDesc(usuarioId);
    }

    /**
     * Contar no leídas
     */
    public long contarNoLeidas(Long usuarioId) {
        return notificationRepository.countByUsuarioIdAndIsReadFalse(usuarioId);
    }

    /**
     * Eliminar notificación
     */
    public void eliminarNotificacion(Long notificationId, Long usuarioId) {
        Notificacion notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new ResourceNotFoundException("Notificación no encontrada"));

        // Verificar que pertenece al usuario
        if (!notification.getUsuario().getId().equals(usuarioId)) {
            throw new UnauthorizedException("No autorizado");
        }

        notificationRepository.delete(notification);
        log.info("Notificación {} eliminada por usuario {}", notificationId, usuarioId);
    }
}