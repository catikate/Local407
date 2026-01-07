package com.example.demo.dto;

import com.example.demo.model.Notificacion;
import com.example.demo.model.PrioridadNotificacion;
import com.example.demo.model.TipoNotificacion;

import java.time.LocalDateTime;

/**
 * DTO para respuestas de notificaciones
 */
public class NotificacionResponse {

    private Long id;
    private Long usuarioId;
    private TipoNotificacion type;
    private String title;
    private String message;
    private Boolean isRead;
    private Boolean emailSent;
    private String metadata;
    private String actionUrl;
    private PrioridadNotificacion priority;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;

    public NotificacionResponse() {}

    public NotificacionResponse(Long id, Long usuarioId, TipoNotificacion type, String title,
                                String message, Boolean isRead, Boolean emailSent, String metadata,
                                String actionUrl, PrioridadNotificacion priority,
                                LocalDateTime createdAt, LocalDateTime readAt) {
        this.id = id;
        this.usuarioId = usuarioId;
        this.type = type;
        this.title = title;
        this.message = message;
        this.isRead = isRead;
        this.emailSent = emailSent;
        this.metadata = metadata;
        this.actionUrl = actionUrl;
        this.priority = priority;
        this.createdAt = createdAt;
        this.readAt = readAt;
    }

    /**
     * Crear desde entidad Notificacion
     */
    public static NotificacionResponse from(Notificacion notification) {
        return new NotificacionResponse(
            notification.getId(),
            notification.getUsuario().getId(),
            notification.getType(),
            notification.getTitle(),
            notification.getMessage(),
            notification.getIsRead(),
            notification.getEmailSent(),
            notification.getMetadata(),
            notification.getActionUrl(),
            notification.getPriority(),
            notification.getCreatedAt(),
            notification.getReadAt()
        );
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Long usuarioId) {
        this.usuarioId = usuarioId;
    }

    public TipoNotificacion getType() {
        return type;
    }

    public void setType(TipoNotificacion type) {
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

    public PrioridadNotificacion getPriority() {
        return priority;
    }

    public void setPriority(PrioridadNotificacion priority) {
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