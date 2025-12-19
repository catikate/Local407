package com.example.demo.model;

public enum ReservaEstado {
    CONFIRMADA,              // Reserva por horas confirmada automáticamente
    PENDIENTE_APROBACIONES,  // Día completo esperando aprobaciones
    APROBADA,                // Día completo con todas las aprobaciones
    RECHAZADA,               // Día completo rechazada por al menos un usuario
    CANCELADA                // Cancelada por el creador
}