package com.example.demo.service;

import com.example.demo.exception.EmailException;
import com.example.demo.model.*;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

/**
 * Servicio para envío de emails
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@local407.com}")
    private String fromEmail;

    /**
     * Enviar email genérico
     */
    public void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);

            log.info("Email enviado a: {}", to);
        } catch (Exception e) {
            log.error("Error enviando email a {}: {}", to, e.getMessage());
            throw new EmailException("Error enviando email", e);
        }
    }

    /**
     * Enviar email con HTML
     */
    public void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // true = HTML

            mailSender.send(message);

            log.info("Email HTML enviado a: {}", to);
        } catch (MessagingException e) {
            log.error("Error enviando email HTML: {}", e.getMessage());
            throw new EmailException("Error enviando email HTML", e);
        }
    }

    /**
     * Template para recordatorio de pago
     */
    public void enviarRecordatorioPago(Usuario usuario) {
        String subject = "🔔 Recordatorio: Cuota Mensual - Local407";

        String body = String.format("""
            Hola %s,

            Te recordamos que hoy es día 4 del mes, fecha de pago de tu cuota mensual.

            Por favor, realiza el pago correspondiente para mantener tu acceso al local.

            Si ya realizaste el pago, por favor ignora este mensaje.

            Saludos,
            El equipo de Local407
            """, usuario.getNombre());

        sendEmail(usuario.getEmail(), subject, body);
    }

    /**
     * Template para recordatorio de ensayo
     */
    public void enviarRecordatorioEnsayo(Usuario usuario, Reserva reserva) {
        String subject = "🎸 Recordatorio: Ensayo Mañana - " + reserva.getBanda().getNombre();

        String body = String.format("""
            Hola %s,

            Te recordamos que mañana tienes ensayo con %s:

            📅 Fecha: %s
            ⏰ Hora: %s - %s
            📍 Local: %s

            ¡Nos vemos!
            """,
            usuario.getNombre(),
            reserva.getBanda().getNombre(),
            reserva.getFechaInicio().toLocalDate(),
            reserva.getFechaInicio().toLocalTime(),
            reserva.getFechaFin().toLocalTime(),
            reserva.getLocal() != null ? reserva.getLocal().getNombre() : "Sin local asignado"
        );

        sendEmail(usuario.getEmail(), subject, body);
    }

    /**
     * Template para solicitud de préstamo de item
     */
    public void enviarSolicitudPrestamo(Usuario propietario, Usuario solicitante, Item item, Prestamo prestamo) {
        String subject = "📦 Solicitud de Préstamo - " + item.getDescripcion();

        String body = String.format("""
            Hola %s,

            %s ha solicitado prestado tu item:

            📦 Item: %s
            📝 Cantidad: %d
            🏢 Local destino: %s
            📅 Devolución esperada: %s

            Puedes aprobar o rechazar esta solicitud desde la aplicación.

            Saludos,
            Local407
            """,
            propietario.getNombre(),
            solicitante.getNombre(),
            item.getDescripcion(),
            item.getCantidad(),
            prestamo.getLocalDestino().getNombre(),
            prestamo.getFechaDevolucionEsperada().toLocalDate()
        );

        sendEmail(propietario.getEmail(), subject, body);
    }

    /**
     * Template para recordatorio de devolución de item
     */
    public void enviarRecordatorioDevolucion(Usuario usuario, Prestamo prestamo) {
        String subject = "📦 Recordatorio: Devolución de Item - " + prestamo.getItem().getDescripcion();

        String body = String.format("""
            Hola %s,

            Te recordamos que mañana vence el plazo de devolución del siguiente item:

            📦 Item: %s
            📅 Fecha de devolución: %s
            🏢 Devolver a: %s

            Por favor, asegúrate de devolver el item a tiempo.

            Saludos,
            Local407
            """,
            usuario.getNombre(),
            prestamo.getItem().getDescripcion(),
            prestamo.getFechaDevolucionEsperada().toLocalDate(),
            prestamo.getLocalOrigen().getNombre()
        );

        sendEmail(usuario.getEmail(), subject, body);
    }

    /**
     * Template para item vencido (no devuelto a tiempo)
     */
    public void enviarNotificacionItemVencido(Usuario propietario, Prestamo prestamo) {
        String subject = "⚠️ URGENTE: Item No Devuelto - " + prestamo.getItem().getDescripcion();

        String body = String.format("""
            Hola %s,

            El siguiente item NO ha sido devuelto en la fecha esperada:

            📦 Item: %s
            👤 Prestado a: %s
            📅 Debía devolverse: %s
            🏢 Local destino: %s

            Por favor, contacta con la persona que tiene el item.

            Saludos,
            Local407
            """,
            propietario.getNombre(),
            prestamo.getItem().getDescripcion(),
            prestamo.getReceptorNombre(),
            prestamo.getFechaDevolucionEsperada().toLocalDate(),
            prestamo.getLocalDestino().getNombre()
        );

        sendEmail(propietario.getEmail(), subject, body);
    }

    /**
     * Template para reserva aprobada
     */
    public void enviarReservaAprobada(Usuario usuario, Reserva reserva) {
        String subject = "✅ Reserva Aprobada - " + reserva.getBanda().getNombre();

        String body = String.format("""
            Hola %s,

            Tu reserva ha sido APROBADA:

            🎵 Banda: %s
            📅 Fecha: %s
            ⏰ Hora: %s - %s
            📍 Local: %s

            ¡Disfruta tu ensayo!

            Saludos,
            Local407
            """,
            usuario.getNombre(),
            reserva.getBanda().getNombre(),
            reserva.getFechaInicio().toLocalDate(),
            reserva.getFechaInicio().toLocalTime(),
            reserva.getFechaFin().toLocalTime(),
            reserva.getLocal() != null ? reserva.getLocal().getNombre() : "Sin local"
        );

        sendEmail(usuario.getEmail(), subject, body);
    }

    /**
     * Template para reserva rechazada
     */
    public void enviarReservaRechazada(Usuario usuario, Reserva reserva, String razon) {
        String subject = "❌ Reserva Rechazada - " + reserva.getBanda().getNombre();

        String body = String.format("""
            Hola %s,

            Lamentamos informarte que tu reserva ha sido rechazada:

            🎵 Banda: %s
            📅 Fecha: %s
            ⏰ Hora: %s - %s

            Razón: %s

            Puedes intentar hacer otra reserva para otra fecha.

            Saludos,
            Local407
            """,
            usuario.getNombre(),
            reserva.getBanda().getNombre(),
            reserva.getFechaInicio().toLocalDate(),
            reserva.getFechaInicio().toLocalTime(),
            reserva.getFechaFin().toLocalTime(),
            razon != null ? razon : "No especificada"
        );

        sendEmail(usuario.getEmail(), subject, body);
    }
}