package com.example.demo.exception;

/**
 * Excepción lanzada cuando hay errores al enviar emails
 */
public class EmailException extends RuntimeException {

    public EmailException(String message) {
        super(message);
    }

    public EmailException(String message, Throwable cause) {
        super(message, cause);
    }
}