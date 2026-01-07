package com.example.demo.repository;

import com.example.demo.model.Notificacion;
import com.example.demo.model.TipoNotificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {
    /**
     * Obtener notificaciones no leídas de un usuario
     */
    List<Notificacion> findByUsuarioIdAndIsReadFalseOrderByCreatedAtDesc(Long usuarioId);

    /**
     * Obtener todas las notificaciones de un usuario
     */
    List<Notificacion> findByUsuarioIdOrderByCreatedAtDesc(Long usuarioId);

    /**
     * Contar notificaciones no leídas de un usuario
     */
    long countByUsuarioIdAndIsReadFalse(Long usuarioId);

    /**
     * Obtener notificaciones por tipo
     */
    List<Notificacion> findByUsuarioIdAndTypeOrderByCreatedAtDesc(
        Long usuarioId,
        TipoNotificacion type
    );

    /**
     * Obtener notificaciones no leídas por tipo
     */
    List<Notificacion> findByUsuarioIdAndTypeAndIsReadFalseOrderByCreatedAtDesc(
        Long usuarioId,
        TipoNotificacion type
    );
}