package com.example.demo.model;

/**
 * Tipos de notificaciones del sistema
 */
public enum NotificationType {
    // Recordatorios
    PAYMENT_REMINDER,           // Recordatorio de pago
    REHEARSAL_REMINDER,         // Recordatorio de ensayo
    RETURN_ITEM_REMINDER,       // Recordatorio devolver item

    // Reservas
    BOOKING_CREATED,            // Nueva reserva
    BOOKING_APPROVED,           // Reserva aprobada
    BOOKING_REJECTED,           // Reserva rechazada
    BOOKING_CANCELLED,          // Reserva cancelada
    BOOKING_PENDING_APPROVAL,   // Reserva pendiente de aprobar

    // Items
    ITEM_LOAN_REQUEST,          // Solicitud de préstamo
    ITEM_LOAN_APPROVED,         // Préstamo aprobado
    ITEM_LOAN_REJECTED,         // Préstamo rechazado
    ITEM_OVERDUE,               // Item no devuelto a tiempo
    ITEM_STATUS_CHANGED,        // Cambio de estado

    // Banda
    MEMBER_ADDED,               // Nuevo miembro
    MEMBER_REMOVED,             // Miembro eliminado
    LOCAL_CHANGED,              // Cambio de local
    SHOW_CREATED                // Nuevo show
}