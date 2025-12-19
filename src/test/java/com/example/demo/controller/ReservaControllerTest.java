package com.example.demo.controller;

import com.example.demo.model.*;
import com.example.demo.service.ReservaService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReservaControllerTest {

    @Mock
    private ReservaService reservaService;

    @InjectMocks
    private ReservaController reservaController;

    private Reserva testReserva;
    private Usuario testUsuario;
    private Local testLocal;
    private ReservaAprobacion testAprobacion;

    @BeforeEach
    void setUp() {
        testUsuario = new Usuario();
        testUsuario.setId(1L);
        testUsuario.setEmail("test@example.com");

        testLocal = new Local();
        testLocal.setId(1L);
        testLocal.setNombre("Test Local");

        testReserva = new Reserva();
        testReserva.setId(1L);
        testReserva.setUsuario(testUsuario);
        testReserva.setLocal(testLocal);
        testReserva.setFechaInicio(LocalDateTime.now());
        testReserva.setFechaFin(LocalDateTime.now().plusHours(2));
        testReserva.setEstado(ReservaEstado.CONFIRMADA);
        testReserva.setEsReservaDiaCompleto(false);

        testAprobacion = new ReservaAprobacion();
        testAprobacion.setId(1L);
        testAprobacion.setReserva(testReserva);
        testAprobacion.setUsuario(testUsuario);
    }

    @Test
    void testGetAllReservas_ReturnsListOfReservas() {
        List<Reserva> reservas = Arrays.asList(testReserva);
        when(reservaService.findAll()).thenReturn(reservas);

        List<Reserva> result = reservaController.getAllReservas();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(1L);
        verify(reservaService, times(1)).findAll();
    }

    @Test
    void testGetReservaById_WithExistingId_ReturnsReserva() {
        when(reservaService.findById(1L)).thenReturn(Optional.of(testReserva));

        ResponseEntity<Reserva> response = reservaController.getReservaById(1L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getId()).isEqualTo(1L);
        verify(reservaService, times(1)).findById(1L);
    }

    @Test
    void testGetReservaById_WithNonExistingId_ReturnsNotFound() {
        when(reservaService.findById(999L)).thenReturn(Optional.empty());

        ResponseEntity<Reserva> response = reservaController.getReservaById(999L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        verify(reservaService, times(1)).findById(999L);
    }

    @Test
    void testGetReservasByUsuario_ReturnsFilteredList() {
        List<Reserva> reservas = Arrays.asList(testReserva);
        when(reservaService.findByUsuarioId(1L)).thenReturn(reservas);

        List<Reserva> result = reservaController.getReservasByUsuario(1L);

        assertThat(result).hasSize(1);
        verify(reservaService, times(1)).findByUsuarioId(1L);
    }

    @Test
    void testGetReservasByLocal_ReturnsFilteredList() {
        List<Reserva> reservas = Arrays.asList(testReserva);
        when(reservaService.findByLocalId(1L)).thenReturn(reservas);

        List<Reserva> result = reservaController.getReservasByLocal(1L);

        assertThat(result).hasSize(1);
        verify(reservaService, times(1)).findByLocalId(1L);
    }

    @Test
    void testGetReservasByEstado_ReturnsFilteredList() {
        List<Reserva> reservas = Arrays.asList(testReserva);
        when(reservaService.findByEstado(ReservaEstado.CONFIRMADA)).thenReturn(reservas);

        List<Reserva> result = reservaController.getReservasByEstado(ReservaEstado.CONFIRMADA);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getEstado()).isEqualTo(ReservaEstado.CONFIRMADA);
        verify(reservaService, times(1)).findByEstado(ReservaEstado.CONFIRMADA);
    }

    @Test
    void testCreateReserva_WithValidData_ReturnsCreated() {
        when(reservaService.save(any(Reserva.class))).thenReturn(testReserva);

        ResponseEntity<?> response = reservaController.createReserva(testReserva);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        verify(reservaService, times(1)).save(any(Reserva.class));
    }

    @Test
    void testCreateReserva_WithInvalidData_ReturnsBadRequest() {
        when(reservaService.save(any(Reserva.class)))
                .thenThrow(new IllegalArgumentException("La fecha de inicio debe ser anterior a la fecha de fin"));

        ResponseEntity<?> response = reservaController.createReserva(testReserva);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        verify(reservaService, times(1)).save(any(Reserva.class));
    }

    @Test
    void testCreateReserva_WithConflict_ReturnsBadRequest() {
        when(reservaService.save(any(Reserva.class)))
                .thenThrow(new IllegalStateException("Ya existe una reserva en ese horario"));

        ResponseEntity<?> response = reservaController.createReserva(testReserva);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        verify(reservaService, times(1)).save(any(Reserva.class));
    }

    @Test
    void testUpdateReserva_WithExistingId_ReturnsUpdated() {
        when(reservaService.findById(1L)).thenReturn(Optional.of(testReserva));
        when(reservaService.save(any(Reserva.class))).thenReturn(testReserva);

        ResponseEntity<?> response = reservaController.updateReserva(1L, testReserva);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(reservaService, times(1)).findById(1L);
        verify(reservaService, times(1)).save(any(Reserva.class));
    }

    @Test
    void testUpdateReserva_WithNonExistingId_ReturnsNotFound() {
        when(reservaService.findById(999L)).thenReturn(Optional.empty());

        ResponseEntity<?> response = reservaController.updateReserva(999L, testReserva);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        verify(reservaService, times(1)).findById(999L);
        verify(reservaService, never()).save(any(Reserva.class));
    }

    @Test
    void testDeleteReserva_WithExistingId_ReturnsNoContent() {
        when(reservaService.findById(1L)).thenReturn(Optional.of(testReserva));
        doNothing().when(reservaService).deleteById(1L);

        ResponseEntity<Void> response = reservaController.deleteReserva(1L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        verify(reservaService, times(1)).findById(1L);
        verify(reservaService, times(1)).deleteById(1L);
    }

    @Test
    void testDeleteReserva_WithNonExistingId_ReturnsNotFound() {
        when(reservaService.findById(999L)).thenReturn(Optional.empty());

        ResponseEntity<Void> response = reservaController.deleteReserva(999L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        verify(reservaService, times(1)).findById(999L);
        verify(reservaService, never()).deleteById(anyLong());
    }

    @Test
    void testGetAprobacionesByReserva_ReturnsList() {
        List<ReservaAprobacion> aprobaciones = Arrays.asList(testAprobacion);
        when(reservaService.findAprobacionesByReservaId(1L)).thenReturn(aprobaciones);

        List<ReservaAprobacion> result = reservaController.getAprobacionesByReserva(1L);

        assertThat(result).hasSize(1);
        verify(reservaService, times(1)).findAprobacionesByReservaId(1L);
    }

    @Test
    void testGetAprobacionesPendientesByUsuario_ReturnsList() {
        List<ReservaAprobacion> aprobaciones = Arrays.asList(testAprobacion);
        when(reservaService.findAprobacionesPendientesByUsuarioId(1L)).thenReturn(aprobaciones);

        List<ReservaAprobacion> result = reservaController.getAprobacionesPendientesByUsuario(1L);

        assertThat(result).hasSize(1);
        verify(reservaService, times(1)).findAprobacionesPendientesByUsuarioId(1L);
    }

    @Test
    void testResponderAprobacion_WithValidData_ReturnsOk() {
        doNothing().when(reservaService).responderAprobacion(1L, true);

        Map<String, Boolean> body = Map.of("aprobada", true);
        ResponseEntity<?> response = reservaController.responderAprobacion(1L, body);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(reservaService, times(1)).responderAprobacion(1L, true);
    }

    @Test
    void testResponderAprobacion_WithMissingField_ReturnsBadRequest() {
        Map<String, Boolean> body = Map.of();
        ResponseEntity<?> response = reservaController.responderAprobacion(1L, body);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        verify(reservaService, never()).responderAprobacion(anyLong(), any());
    }

    @Test
    void testResponderAprobacion_WithInvalidId_ReturnsBadRequest() {
        doThrow(new IllegalArgumentException("Aprobación no encontrada"))
                .when(reservaService).responderAprobacion(999L, true);

        Map<String, Boolean> body = Map.of("aprobada", true);
        ResponseEntity<?> response = reservaController.responderAprobacion(999L, body);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        verify(reservaService, times(1)).responderAprobacion(999L, true);
    }
}