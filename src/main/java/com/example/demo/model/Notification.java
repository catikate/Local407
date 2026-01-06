package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entidad para gestionar notificaciones del sistema
 */
@Entity
@Table(name = "notifications")
@JsonIgnoreProperties({"usuario"})
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Usuario destinatario
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    // Tipo de notificación
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    // Título y mensaje
    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String message;

    // Leída o no
    @Column(nullable = false)
    private Boolean isRead = false;

    // Enviada por email o no
    @Column(nullable = false)
    private Boolean emailSent = false;

    // Datos relacionados (JSON para flexibilidad)
    @Column(columnDefinition = "JSON")
    private String metadata;

    // URL de acción (ej: "/bookings/123")
    private String actionUrl;

    // Prioridad
    @Enumerated(EnumType.STRING)
    private NotificationPriority priority = NotificationPriority.NORMAL;

    // Auditoría
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime readAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Constructores
    public Notification() {}

    public Notification(Usuario usuario, NotificationType type, String title, String message) {
        this.usuario = usuario;
        this.type = type;
        this.title = title;
        this.message = message;
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public NotificationType getType() {
        return type;
    }

    public void setType(NotificationType type) {
        this.type = type;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Boolean getIsRead() {
        return isRead;
    }

    public void setIsRead(Boolean isRead) {
        this.isRead = isRead;
    }

    public Boolean getEmailSent() {
        return emailSent;
    }

    public void setEmailSent(Boolean emailSent) {
        this.emailSent = emailSent;
    }

    public String getMetadata() {
        return metadata;
    }

    public void setMetadata(String metadata) {
        this.metadata = metadata;
    }

    public String getActionUrl() {
        return actionUrl;
    }

    public void setActionUrl(String actionUrl) {
        this.actionUrl = actionUrl;
    }

    public NotificationPriority getPriority() {
        return priority;
    }

    public void setPriority(NotificationPriority priority) {
        this.priority = priority;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getReadAt() {
        return readAt;
    }

    public void setReadAt(LocalDateTime readAt) {
        this.readAt = readAt;
    }
}