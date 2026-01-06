package com.example.demo.exception;

/**
 * Excepción lanzada cuando un usuario no está autorizado
 */
public class UnauthorizedException extends RuntimeException {

    public UnauthorizedException(String message) {
        super(message);
    }

    public UnauthorizedException(String message, Throwable cause) {
        super(message, cause);
    }
}