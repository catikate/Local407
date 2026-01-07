package com.example.demo.scheduler;

import com.example.demo.model.*;
import com.example.demo.repository.PrestamoRepository;
import com.example.demo.repository.ReservaRepository;
import com.example.demo.repository.UsuarioRepository;
import com.example.demo.service.EmailService;
import com.example.demo.service.NotificacionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Tareas programadas para notificaciones automáticas
 */
@Component
@EnableScheduling
public class NotificacionScheduler {

    private static final Logger log = LoggerFactory.getLogger(NotificacionScheduler.class);

    @Autowired
    private NotificacionService notificationService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ReservaRepository reservaRepository;

    @Autowired
    private PrestamoRepository prestamoRepository;

    /**
     * RECORDATORIO DE PAGO MENSUAL
     * Se ejecuta día 4 de cada mes a las 10:00 AM
     * Cron: segundos minutos hora día mes día-semana
     */
    @Scheduled(cron = "0 0 10 4 * ?")
    public void recordatorioPagoMensual() {
        log.info("========================================");
        log.info("Ejecutando recordatorio de pago mensual...");
        log.info("========================================");

        List<Usuario> usuarios = usuarioRepository.findAll();
        int enviados = 0;

        for (Usuario usuario : usuarios) {
            try {
                // Crear notificación in-app
                notificationService.crearNotificacion(
                    usuario,
                    TipoNotificacion.PAYMENT_REMINDER,
                    "💰 Recordatorio: Pago de Cuota Mensual",
                    "Hoy es día 4, fecha de pago de tu cuota mensual. Por favor, realiza el pago correspondiente.",
                    "/pagos",
                    PrioridadNotificacion.HIGH,
                    false
                );

                // Enviar email específico
                if (usuario.getEmail() != null) {
                    emailService.enviarRecordatorioPago(usuario);
                    enviados++;
                }

            } catch (Exception e) {
                log.error("Error enviando recordatorio a {}: {}",
                    usuario.getEmail(), e.getMessage());
            }
        }

        log.info("Recordatorios de pago enviados a {} usuarios de {}", enviados, usuarios.size());
    }

    /**
     * RECORDATORIO DE ENSAYOS (RESERVAS)
     * Se ejecuta todos los días a las 18:00
     * Notifica ensayos del día siguiente
     */
    @Scheduled(cron = "0 0 18 * * ?")
    public void recordatorioEnsayos() {
        log.info("========================================");
        log.info("Ejecutando recordatorio de ensayos para mañana...");
        log.info("========================================");

        LocalDateTime mañanaInicio = LocalDateTime.now().plusDays(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime mañanaFin = mañanaInicio.plusDays(1);

        // Obtener ensayos de mañana
        List<Reserva> ensayosMañana = reservaRepository.findByFechaInicioBetween(
            mañanaInicio, mañanaFin
        );

        log.info("Encontradas {} reservas para mañana", ensayosMañana.size());

        int notificacionesEnviadas = 0;

        for (Reserva reserva : ensayosMañana) {
            // Solo notificar ensayos (no shows)
            if (reserva.getTipoEvento() != TipoEvento.ENSAYO) {
                continue;
            }

            // Verificar que tenga banda con miembros
            if (reserva.getBanda() == null || reserva.getBanda().getMiembros().isEmpty()) {
                log.warn("Reserva {} no tiene banda o miembros", reserva.getId());
                continue;
            }

            for (Usuario miembro : reserva.getBanda().getMiembros()) {
                try {
                    // Notificación in-app
                    notificationService.crearNotificacion(
                        miembro,
                        TipoNotificacion.REHEARSAL_REMINDER,
                        "🎸 Recordatorio: Ensayo Mañana",
                        String.format("Tienes ensayo con %s mañana a las %s",
                            reserva.getBanda().getNombre(),
                            reserva.getFechaInicio().toLocalTime()
                        ),
                        "/reservas/" + reserva.getId(),
                        PrioridadNotificacion.NORMAL,
                        false
                    );

                    // Email
                    if (miembro.getEmail() != null) {
                        emailService.enviarRecordatorioEnsayo(miembro, reserva);
                        notificacionesEnviadas++;
                    }

                } catch (Exception e) {
                    log.error("Error enviando recordatorio de ensayo a {}: {}",
                        miembro.getEmail(), e.getMessage());
                }
            }
        }

        log.info("Recordatorios enviados: {} notificaciones para {} ensayos",
            notificacionesEnviadas, ensayosMañana.size());
    }

    /**
     * RECORDATORIO DE DEVOLUCIÓN DE ITEMS
     * Se ejecuta todos los días a las 09:00
     * Notifica préstamos que vencen mañana
     */
    @Scheduled(cron = "0 0 9 * * ?")
    public void recordatorioDevolucionItems() {
        log.info("========================================");
        log.info("Ejecutando recordatorio de devolución de items...");
        log.info("========================================");

        LocalDateTime mañanaInicio = LocalDateTime.now().plusDays(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime mañanaFin = mañanaInicio.plusDays(1);

        // Buscar préstamos activos que vencen mañana
        List<Prestamo> prestamosVencenMañana = prestamoRepository
            .findByEstadoAndFechaDevolucionEsperadaBetween(
                EstadoPrestamo.ACTIVO,
                mañanaInicio,
                mañanaFin
            );

        log.info("Encontrados {} préstamos que vencen mañana", prestamosVencenMañana.size());

        int notificacionesEnviadas = 0;

        for (Prestamo prestamo : prestamosVencenMañana) {
            try {
                // Notificar al usuario que tiene el item
                Usuario receptor = prestamo.getPrestadoAUsuario();
                if (receptor != null && receptor.getEmail() != null) {

                    // Notificación in-app
                    notificationService.crearNotificacion(
                        receptor,
                        TipoNotificacion.RETURN_ITEM_REMINDER,
                        "📦 Recordatorio: Devolución de Item",
                        String.format("Mañana vence el plazo de devolución del item: %s",
                            prestamo.getItem().getDescripcion()
                        ),
                        "/prestamos/" + prestamo.getId(),
                        PrioridadNotificacion.HIGH,
                        false
                    );

                    // Email
                    emailService.enviarRecordatorioDevolucion(receptor, prestamo);
                    notificacionesEnviadas++;
                }

            } catch (Exception e) {
                log.error("Error enviando recordatorio de devolución: {}", e.getMessage());
            }
        }

        log.info("Recordatorios de devolución enviados: {}", notificacionesEnviadas);
    }

    /**
     * VERIFICAR ITEMS VENCIDOS (NO DEVUELTOS A TIEMPO)
     * Se ejecuta todos los días a las 10:00
     * Notifica al propietario sobre items no devueltos
     */
    @Scheduled(cron = "0 0 10 * * ?")
    public void verificarItemsVencidos() {
        log.info("========================================");
        log.info("Verificando items con préstamos vencidos...");
        log.info("========================================");

        LocalDateTime ahora = LocalDateTime.now();

        // Buscar préstamos activos cuya fecha de devolución ya pasó
        List<Prestamo> prestamosVencidos = prestamoRepository
            .findByEstadoAndFechaDevolucionEsperadaBefore(
                EstadoPrestamo.ACTIVO,
                ahora
            );

        log.info("Encontrados {} préstamos vencidos", prestamosVencidos.size());

        int notificacionesEnviadas = 0;

        for (Prestamo prestamo : prestamosVencidos) {
            try {
                Usuario propietario = prestamo.getItem().getPropietarioUsuario();
                if (propietario == null || propietario.getEmail() == null) {
                    continue;
                }

                // Verificar si ya se notificó hoy (evitar spam)
                // TODO: Implementar lógica para no enviar múltiples veces al día

                // Notificar al propietario
                notificationService.notificarItemVencido(prestamo);
                notificacionesEnviadas++;

            } catch (Exception e) {
                log.error("Error notificando item vencido: {}", e.getMessage());
            }
        }

        log.info("Notificaciones de items vencidos enviadas: {}", notificacionesEnviadas);
    }

    /**
     * LIMPIEZA DE NOTIFICACIONES ANTIGUAS
     * Se ejecuta todos los domingos a las 02:00
     * Elimina notificaciones leídas con más de 30 días
     */
    @Scheduled(cron = "0 0 2 * * SUN")
    public void limpiarNotificacionesAntiguas() {
        log.info("========================================");
        log.info("Ejecutando limpieza de notificaciones antiguas...");
        log.info("========================================");

        // TODO: Implementar limpieza de notificaciones antiguas
        // Buscar notificaciones leídas con más de 30 días y eliminarlas
        // LocalDateTime hace30Dias = LocalDateTime.now().minusDays(30);

        log.info("Limpieza de notificaciones completada");
    }
}