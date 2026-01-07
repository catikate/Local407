package com.example.demo.service;

import com.example.demo.model.Notificacion;
import com.example.demo.model.PrioridadNotificacion;
import com.example.demo.model.TipoNotificacion;
import com.example.demo.model.Usuario;
import com.example.demo.repository.NotificacionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificacionServiceTest {

    @Mock
    private NotificacionRepository notificationRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private NotificacionService notificationService;

    private Usuario testUser;
    private Notificacion testNotification;

    @BeforeEach
    void setUp() {
        testUser = new Usuario();
        testUser.setId(1L);
        testUser.setNombre("Test");
        testUser.setApellido("User");
        testUser.setEmail("test@example.com");

        testNotification = new Notificacion();
        testNotification.setId(1L);
        testNotification.setUsuario(testUser);
        testNotification.setType(TipoNotificacion.BOOKING_APPROVED);
        testNotification.setTitle("Test Notificacion");
        testNotification.setMessage("This is a test notification");
        testNotification.setIsRead(false);
        testNotification.setPriority(PrioridadNotificacion.NORMAL);
    }

    @Test
    void testCrearNotificacion_WithoutEmail() {
        when(notificationRepository.save(any(Notificacion.class))).thenReturn(testNotification);

        Notificacion result = notificationService.crearNotificacion(
            testUser,
            TipoNotificacion.BOOKING_APPROVED,
            "Test Title",
            "Test Message",
            "/test",
            PrioridadNotificacion.NORMAL,
            false
        );

        assertThat(result).isNotNull();
        assertThat(result.getUsuario()).isEqualTo(testUser);
        assertThat(result.getType()).isEqualTo(TipoNotificacion.BOOKING_APPROVED);
        verify(notificationRepository, times(1)).save(any(Notificacion.class));
        verify(emailService, never()).sendEmail(anyString(), anyString(), anyString());
    }

    @Test
    void testCrearNotificacion_WithEmail() {
        when(notificationRepository.save(any(Notificacion.class))).thenReturn(testNotification);
        doNothing().when(emailService).sendEmail(anyString(), anyString(), anyString());

        Notificacion result = notificationService.crearNotificacion(
            testUser,
            TipoNotificacion.BOOKING_APPROVED,
            "Test Title",
            "Test Message",
            "/test",
            PrioridadNotificacion.HIGH,
            true
        );

        assertThat(result).isNotNull();
        // Se llama save 2 veces: al crear y al marcar emailSent
        verify(notificationRepository, times(2)).save(any(Notificacion.class));
        verify(emailService, times(1)).sendEmail(
            eq(testUser.getEmail()),
            anyString(),
            anyString()
        );
    }

    @Test
    void testGetNotificacionesNoLeidas() {
        Notificacion notification2 = new Notificacion();
        notification2.setId(2L);
        notification2.setUsuario(testUser);
        notification2.setIsRead(false);

        when(notificationRepository.findByUsuarioIdAndIsReadFalseOrderByCreatedAtDesc(1L))
            .thenReturn(Arrays.asList(testNotification, notification2));

        List<Notificacion> result = notificationService.getNotificacionesNoLeidas(1L);

        assertThat(result).hasSize(2);
        assertThat(result).contains(testNotification, notification2);
        verify(notificationRepository, times(1))
            .findByUsuarioIdAndIsReadFalseOrderByCreatedAtDesc(1L);
    }

    @Test
    void testContarNoLeidas() {
        when(notificationRepository.countByUsuarioIdAndIsReadFalse(1L)).thenReturn(5L);

        long count = notificationService.contarNoLeidas(1L);

        assertThat(count).isEqualTo(5L);
        verify(notificationRepository, times(1)).countByUsuarioIdAndIsReadFalse(1L);
    }

    @Test
    void testMarcarComoLeida() {
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(testNotification));
        when(notificationRepository.save(any(Notificacion.class))).thenReturn(testNotification);

        notificationService.marcarComoLeida(1L, 1L);

        assertThat(testNotification.getIsRead()).isTrue();
        assertThat(testNotification.getReadAt()).isNotNull();
        verify(notificationRepository, times(1)).findById(1L);
        verify(notificationRepository, times(1)).save(testNotification);
    }

    @Test
    void testMarcarTodasComoLeidas() {
        Notificacion notification2 = new Notificacion();
        notification2.setId(2L);
        notification2.setUsuario(testUser);
        notification2.setIsRead(false);

        when(notificationRepository.findByUsuarioIdAndIsReadFalseOrderByCreatedAtDesc(1L))
            .thenReturn(Arrays.asList(testNotification, notification2));
        when(notificationRepository.saveAll(anyList())).thenReturn(Arrays.asList(testNotification, notification2));

        notificationService.marcarTodasComoLeidas(1L);

        verify(notificationRepository, times(1))
            .findByUsuarioIdAndIsReadFalseOrderByCreatedAtDesc(1L);
        verify(notificationRepository, times(1)).saveAll(anyList());
    }

    @Test
    void testEliminarNotificacion() {
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(testNotification));
        doNothing().when(notificationRepository).delete(any(Notificacion.class));

        notificationService.eliminarNotificacion(1L, 1L);

        verify(notificationRepository, times(1)).findById(1L);
        verify(notificationRepository, times(1)).delete(testNotification);
    }

    @Test
    void testGetTodasLasNotificaciones() {
        Notificacion notification2 = new Notificacion();
        notification2.setId(2L);
        notification2.setUsuario(testUser);
        notification2.setIsRead(true);

        when(notificationRepository.findByUsuarioIdOrderByCreatedAtDesc(1L))
            .thenReturn(Arrays.asList(testNotification, notification2));

        List<Notificacion> result = notificationService.getTodasLasNotificaciones(1L);

        assertThat(result).hasSize(2);
        verify(notificationRepository, times(1)).findByUsuarioIdOrderByCreatedAtDesc(1L);
    }
}