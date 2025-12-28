package com.example.demo.model;

public enum EstadoPrestamo {
    ACTIVO,      // Préstamo activo, aún no devuelto
    DEVUELTO,    // Item ya fue devuelto
    VENCIDO      // Fecha de devolución pasada, aún no devuelto
}