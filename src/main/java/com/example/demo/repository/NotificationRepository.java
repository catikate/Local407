package com.example.demo.repository;

import com.example.demo.model.Notification;
import com.example.demo.model.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /**
     * Obtener notificaciones no leídas de un usuario
     */
    List<Notification> findByUsuarioIdAndIsReadFalseOrderByCreatedAtDesc(Long usuarioId);

    /**
     * Obtener todas las notificaciones de un usuario
     */
    List<Notification> findByUsuarioIdOrderByCreatedAtDesc(Long usuarioId);

    /**
     * Contar notificaciones no leídas de un usuario
     */
    long countByUsuarioIdAndIsReadFalse(Long usuarioId);

    /**
     * Obtener notificaciones por tipo
     */
    List<Notification> findByUsuarioIdAndTypeOrderByCreatedAtDesc(
        Long usuarioId,
        NotificationType type
    );

    /**
     * Obtener notificaciones no leídas por tipo
     */
    List<Notification> findByUsuarioIdAndTypeAndIsReadFalseOrderByCreatedAtDesc(
        Long usuarioId,
        NotificationType type
    );
}