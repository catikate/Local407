package com.example.demo.service;

import com.example.demo.model.Invitacion;
import com.example.demo.model.InvitacionEstado;
import com.example.demo.repository.InvitacionRepository;
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
class InvitacionServiceTest {

    @Mock
    private InvitacionRepository invitacionRepository;

    @InjectMocks
    private InvitacionService invitacionService;

    private Invitacion testInvitacion;

    @BeforeEach
    void setUp() {
        testInvitacion = new Invitacion();
        testInvitacion.setId(1L);
        testInvitacion.setEstado(InvitacionEstado.PENDIENTE);
    }

    @Test
    void testFindAll_ReturnsAllInvitaciones() {
        Invitacion invitacion2 = new Invitacion();
        invitacion2.setId(2L);

        when(invitacionRepository.findAll()).thenReturn(Arrays.asList(testInvitacion, invitacion2));

        List<Invitacion> result = invitacionService.findAll();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getId()).isEqualTo(1L);
        verify(invitacionRepository, times(1)).findAll();
    }

    @Test
    void testFindById_WithExistingId_ReturnsInvitacion() {
        when(invitacionRepository.findById(1L)).thenReturn(Optional.of(testInvitacion));

        Optional<Invitacion> result = invitacionService.findById(1L);

        assertThat(result).isPresent();
        assertThat(result.get().getId()).isEqualTo(1L);
        verify(invitacionRepository, times(1)).findById(1L);
    }

    @Test
    void testFindById_WithNonExistingId_ReturnsEmpty() {
        when(invitacionRepository.findById(999L)).thenReturn(Optional.empty());

        Optional<Invitacion> result = invitacionService.findById(999L);

        assertThat(result).isEmpty();
        verify(invitacionRepository, times(1)).findById(999L);
    }

    @Test
    void testFindByDeId_ReturnsFilteredInvitaciones() {
        when(invitacionRepository.findByDeId(1L)).thenReturn(Arrays.asList(testInvitacion));

        List<Invitacion> result = invitacionService.findByDeId(1L);

        assertThat(result).hasSize(1);
        verify(invitacionRepository, times(1)).findByDeId(1L);
    }

    @Test
    void testFindByAId_ReturnsFilteredInvitaciones() {
        when(invitacionRepository.findByAId(1L)).thenReturn(Arrays.asList(testInvitacion));

        List<Invitacion> result = invitacionService.findByAId(1L);

        assertThat(result).hasSize(1);
        verify(invitacionRepository, times(1)).findByAId(1L);
    }

    @Test
    void testFindByLocalId_ReturnsFilteredInvitaciones() {
        when(invitacionRepository.findByLocalId(1L)).thenReturn(Arrays.asList(testInvitacion));

        List<Invitacion> result = invitacionService.findByLocalId(1L);

        assertThat(result).hasSize(1);
        verify(invitacionRepository, times(1)).findByLocalId(1L);
    }

    @Test
    void testFindByEstado_ReturnsFilteredInvitaciones() {
        when(invitacionRepository.findByEstado(InvitacionEstado.PENDIENTE))
                .thenReturn(Arrays.asList(testInvitacion));

        List<Invitacion> result = invitacionService.findByEstado(InvitacionEstado.PENDIENTE);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getEstado()).isEqualTo(InvitacionEstado.PENDIENTE);
        verify(invitacionRepository, times(1)).findByEstado(InvitacionEstado.PENDIENTE);
    }

    @Test
    void testSave_CreatesNewInvitacion() {
        when(invitacionRepository.save(any(Invitacion.class))).thenReturn(testInvitacion);

        Invitacion result = invitacionService.save(testInvitacion);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        verify(invitacionRepository, times(1)).save(testInvitacion);
    }

    @Test
    void testDeleteById_DeletesInvitacion() {
        doNothing().when(invitacionRepository).deleteById(1L);

        invitacionService.deleteById(1L);

        verify(invitacionRepository, times(1)).deleteById(1L);
    }
}