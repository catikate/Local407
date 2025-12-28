package com.example.demo.service;

import com.example.demo.model.*;
import com.example.demo.repository.BandaRepository;
import com.example.demo.repository.ReservaAprobacionRepository;
import com.example.demo.repository.ReservaRepository;
import com.example.demo.repository.UsuarioLocalRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReservaServiceTest {

    @Mock
    private ReservaRepository reservaRepository;

    @Mock
    private ReservaAprobacionRepository aprobacionRepository;

    @Mock
    private UsuarioLocalRepository usuarioLocalRepository;

    @Mock
    private BandaRepository bandaRepository;

    @InjectMocks
    private ReservaService reservaService;

    private Reserva testReserva;
    private Usuario testUsuario;
    private Local testLocal;
    private ReservaAprobacion testAprobacion;
    private UsuarioLocal usuarioLocal;

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
        testReserva.setEsReservaDiaCompleto(false);
        testReserva.setTipoEvento(TipoEvento.ENSAYO); // Default

        testAprobacion = new ReservaAprobacion();
        testAprobacion.setId(1L);
        testAprobacion.setReserva(testReserva);
        testAprobacion.setUsuario(testUsuario);

        usuarioLocal = new UsuarioLocal();
        usuarioLocal.setUsuario(testUsuario);
        usuarioLocal.setLocal(testLocal);
    }

    @Test
    void testFindAll_ReturnsAllReservas() {
        when(reservaRepository.findAll()).thenReturn(Arrays.asList(testReserva));

        List<Reserva> result = reservaService.findAll();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(1L);
        verify(reservaRepository, times(1)).findAll();
    }

    @Test
    void testFindById_WithExistingId_ReturnsReserva() {
        when(reservaRepository.findById(1L)).thenReturn(Optional.of(testReserva));

        Optional<Reserva> result = reservaService.findById(1L);

        assertThat(result).isPresent();
        assertThat(result.get().getId()).isEqualTo(1L);
        verify(reservaRepository, times(1)).findById(1L);
    }

    @Test
    void testFindByUsuarioId_ReturnsFilteredReservas() {
        when(reservaRepository.findByUsuarioId(1L)).thenReturn(Arrays.asList(testReserva));

        List<Reserva> result = reservaService.findByUsuarioId(1L);

        assertThat(result).hasSize(1);
        verify(reservaRepository, times(1)).findByUsuarioId(1L);
    }

    @Test
    void testFindByLocalId_ReturnsFilteredReservas() {
        when(reservaRepository.findByLocalId(1L)).thenReturn(Arrays.asList(testReserva));

        List<Reserva> result = reservaService.findByLocalId(1L);

        assertThat(result).hasSize(1);
        verify(reservaRepository, times(1)).findByLocalId(1L);
    }

    @Test
    void testFindByEstado_ReturnsFilteredReservas() {
        when(reservaRepository.findByEstado(ReservaEstado.CONFIRMADA)).thenReturn(Arrays.asList(testReserva));

        List<Reserva> result = reservaService.findByEstado(ReservaEstado.CONFIRMADA);

        assertThat(result).hasSize(1);
        verify(reservaRepository, times(1)).findByEstado(ReservaEstado.CONFIRMADA);
    }

    @Test
    void testSave_NewReservaNoDiaCompleto_CreatesConfirmada() {
        testReserva.setId(null);
        testReserva.setEsReservaDiaCompleto(false);

        when(reservaRepository.findConflictingReservas(anyLong(), any(), any()))
                .thenReturn(Collections.emptyList());
        when(reservaRepository.save(any(Reserva.class))).thenReturn(testReserva);

        Reserva result = reservaService.save(testReserva);

        assertThat(result).isNotNull();
        verify(reservaRepository, times(1)).save(any(Reserva.class));
        verify(usuarioLocalRepository, never()).findByLocalId(anyLong());
    }

    @Test
    void testSave_NewReservaDiaCompleto_CreatesPendienteAprobaciones() {
        testReserva.setId(null);
        testReserva.setEsReservaDiaCompleto(true);
        testReserva.setEstado(null);

        Usuario otherUser = new Usuario();
        otherUser.setId(2L);
        UsuarioLocal otherUsuarioLocal = new UsuarioLocal();
        otherUsuarioLocal.setUsuario(otherUser);
        otherUsuarioLocal.setLocal(testLocal);

        when(reservaRepository.findConflictingReservas(anyLong(), any(), any()))
                .thenReturn(Collections.emptyList());
        when(reservaRepository.save(any(Reserva.class))).thenReturn(testReserva);
        when(usuarioLocalRepository.findByLocalId(1L)).thenReturn(Arrays.asList(usuarioLocal, otherUsuarioLocal));

        Reserva result = reservaService.save(testReserva);

        assertThat(result).isNotNull();
        verify(reservaRepository, times(1)).save(any(Reserva.class));
        verify(usuarioLocalRepository, times(1)).findByLocalId(1L);
        verify(aprobacionRepository, times(1)).save(any(ReservaAprobacion.class));
    }

    @Test
    void testSave_WithInvalidDates_ThrowsException() {
        testReserva.setId(null);
        testReserva.setFechaInicio(LocalDateTime.now());
        testReserva.setFechaFin(LocalDateTime.now().minusHours(1));

        assertThatThrownBy(() -> reservaService.save(testReserva))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("La fecha de inicio debe ser anterior a la fecha de fin");

        verify(reservaRepository, never()).save(any(Reserva.class));
    }

    @Test
    void testSave_WithConflictingReserva_ThrowsException() {
        testReserva.setId(null);
        testReserva.setTipoEvento(TipoEvento.ENSAYO);
        Reserva conflictingReserva = new Reserva();

        when(reservaRepository.findConflictingReservas(anyLong(), any(), any()))
                .thenReturn(Arrays.asList(conflictingReserva));

        assertThatThrownBy(() -> reservaService.save(testReserva))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Ya existe una reserva en ese horario en el local");

        verify(reservaRepository, never()).save(any(Reserva.class));
    }

    @Test
    void testSave_UpdateExistingReserva_UpdatesSuccessfully() {
        when(reservaRepository.findConflictingReservasExcluding(anyLong(), anyLong(), any(), any()))
                .thenReturn(Collections.emptyList());
        when(reservaRepository.save(any(Reserva.class))).thenReturn(testReserva);

        Reserva result = reservaService.save(testReserva);

        assertThat(result).isNotNull();
        verify(reservaRepository, times(1)).save(any(Reserva.class));
    }

    @Test
    void testResponderAprobacion_WithValidData_UpdatesAprobacion() {
        when(aprobacionRepository.findById(1L)).thenReturn(Optional.of(testAprobacion));
        when(aprobacionRepository.save(any(ReservaAprobacion.class))).thenReturn(testAprobacion);
        when(reservaRepository.findById(1L)).thenReturn(Optional.of(testReserva));
        when(aprobacionRepository.findByReservaId(1L)).thenReturn(Arrays.asList(testAprobacion));

        reservaService.responderAprobacion(1L, true);

        verify(aprobacionRepository, times(1)).findById(1L);
        verify(aprobacionRepository, times(1)).save(any(ReservaAprobacion.class));
    }

    @Test
    void testResponderAprobacion_WithNonExistentId_ThrowsException() {
        when(aprobacionRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> reservaService.responderAprobacion(999L, true))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Aprobación no encontrada");

        verify(aprobacionRepository, never()).save(any(ReservaAprobacion.class));
    }

    @Test
    void testFindAprobacionesByReservaId_ReturnsList() {
        when(aprobacionRepository.findByReservaId(1L)).thenReturn(Arrays.asList(testAprobacion));

        List<ReservaAprobacion> result = reservaService.findAprobacionesByReservaId(1L);

        assertThat(result).hasSize(1);
        verify(aprobacionRepository, times(1)).findByReservaId(1L);
    }

    @Test
    void testFindAprobacionesPendientesByUsuarioId_ReturnsOnlyPending() {
        testAprobacion.setAprobada(null);
        ReservaAprobacion approvedAprobacion = new ReservaAprobacion();
        approvedAprobacion.setId(2L);
        approvedAprobacion.setAprobada(true);

        when(aprobacionRepository.findByUsuarioId(1L))
                .thenReturn(Arrays.asList(testAprobacion, approvedAprobacion));

        List<ReservaAprobacion> result = reservaService.findAprobacionesPendientesByUsuarioId(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getAprobada()).isNull();
        verify(aprobacionRepository, times(1)).findByUsuarioId(1L);
    }

    @Test
    void testDeleteById_DeletesReserva() {
        doNothing().when(reservaRepository).deleteById(1L);

        reservaService.deleteById(1L);

        verify(reservaRepository, times(1)).deleteById(1L);
    }

    // Tests para validaciones por tipo de evento

    @Test
    void testSave_EnsayoWithoutLocal_ThrowsException() {
        testReserva.setId(null);
        testReserva.setTipoEvento(TipoEvento.ENSAYO);
        testReserva.setLocal(null);

        assertThatThrownBy(() -> reservaService.save(testReserva))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("El local es obligatorio para ensayos");

        verify(reservaRepository, never()).save(any(Reserva.class));
    }

    @Test
    void testSave_ShowWithoutBanda_ThrowsException() {
        testReserva.setId(null);
        testReserva.setTipoEvento(TipoEvento.SHOW);
        testReserva.setBanda(null);

        assertThatThrownBy(() -> reservaService.save(testReserva))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("La banda es obligatoria para shows");

        verify(reservaRepository, never()).save(any(Reserva.class));
    }

    @Test
    void testSave_ShowWithConflictingBanda_ThrowsException() {
        testReserva.setId(null);
        testReserva.setTipoEvento(TipoEvento.SHOW);
        Banda testBanda = new Banda();
        testBanda.setId(1L);
        testReserva.setBanda(testBanda);

        Reserva conflictingShow = new Reserva();
        when(reservaRepository.findConflictingShowsForBanda(anyLong(), any(), any()))
                .thenReturn(Arrays.asList(conflictingShow));

        assertThatThrownBy(() -> reservaService.save(testReserva))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("La banda ya tiene un show en ese horario");

        verify(reservaRepository, never()).save(any(Reserva.class));
    }

    @Test
    void testSave_ShowPersonalWithConflict_ThrowsException() {
        testReserva.setId(null);
        testReserva.setTipoEvento(TipoEvento.SHOW_PERSONAL);
        testReserva.setLocal(null); // Personal shows don't require local

        Reserva conflictingPersonalShow = new Reserva();
        when(reservaRepository.findConflictingPersonalShows(anyLong(), any(), any()))
                .thenReturn(Arrays.asList(conflictingPersonalShow));

        assertThatThrownBy(() -> reservaService.save(testReserva))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Ya tienes un show personal en ese horario");

        verify(reservaRepository, never()).save(any(Reserva.class));
    }

    @Test
    void testSave_ShowPersonalWithoutConflict_CreatesSuccessfully() {
        testReserva.setId(null);
        testReserva.setTipoEvento(TipoEvento.SHOW_PERSONAL);
        testReserva.setLocal(null);

        when(reservaRepository.findConflictingPersonalShows(anyLong(), any(), any()))
                .thenReturn(Collections.emptyList());
        when(reservaRepository.save(any(Reserva.class))).thenReturn(testReserva);

        Reserva result = reservaService.save(testReserva);

        assertThat(result).isNotNull();
        assertThat(result.getEstado()).isEqualTo(ReservaEstado.CONFIRMADA);
        verify(reservaRepository, times(1)).save(any(Reserva.class));
    }

    @Test
    void testSave_ShowWithValidBanda_CreatesSuccessfully() {
        testReserva.setId(null);
        testReserva.setTipoEvento(TipoEvento.SHOW);
        Banda testBanda = new Banda();
        testBanda.setId(1L);
        testReserva.setBanda(testBanda);

        when(reservaRepository.findConflictingShowsForBanda(anyLong(), any(), any()))
                .thenReturn(Collections.emptyList());
        when(reservaRepository.save(any(Reserva.class))).thenReturn(testReserva);

        Reserva result = reservaService.save(testReserva);

        assertThat(result).isNotNull();
        assertThat(result.getEstado()).isEqualTo(ReservaEstado.CONFIRMADA);
        verify(reservaRepository, times(1)).save(any(Reserva.class));
    }

    @Test
    void testSave_EnsayoDiaCompletoCreatesAprobaciones_ShowDoesNot() {
        // ENSAYO día completo debe crear aprobaciones
        testReserva.setId(null);
        testReserva.setTipoEvento(TipoEvento.ENSAYO);
        testReserva.setEsReservaDiaCompleto(true);

        Usuario otherUser = new Usuario();
        otherUser.setId(2L);
        UsuarioLocal otherUsuarioLocal = new UsuarioLocal();
        otherUsuarioLocal.setUsuario(otherUser);
        otherUsuarioLocal.setLocal(testLocal);

        when(reservaRepository.findConflictingReservas(anyLong(), any(), any()))
                .thenReturn(Collections.emptyList());
        when(reservaRepository.save(any(Reserva.class))).thenReturn(testReserva);
        when(usuarioLocalRepository.findByLocalId(1L))
                .thenReturn(Arrays.asList(usuarioLocal, otherUsuarioLocal));

        reservaService.save(testReserva);

        verify(aprobacionRepository, times(1)).save(any(ReservaAprobacion.class));

        // SHOW no debe crear aprobaciones incluso si esReservaDiaCompleto es true
        Reserva showReserva = new Reserva();
        showReserva.setUsuario(testUsuario);
        showReserva.setTipoEvento(TipoEvento.SHOW);
        showReserva.setEsReservaDiaCompleto(true); // Esto no debería importar
        Banda banda = new Banda();
        banda.setId(1L);
        showReserva.setBanda(banda);
        showReserva.setFechaInicio(LocalDateTime.now());
        showReserva.setFechaFin(LocalDateTime.now().plusHours(2));

        when(reservaRepository.findConflictingShowsForBanda(anyLong(), any(), any()))
                .thenReturn(Collections.emptyList());
        when(reservaRepository.save(any(Reserva.class))).thenReturn(showReserva);

        reservaService.save(showReserva);

        // Solo debe haber sido llamado 1 vez (por el ENSAYO), no por el SHOW
        verify(aprobacionRepository, times(1)).save(any(ReservaAprobacion.class));
    }
}