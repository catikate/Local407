package com.example.demo.service;

import com.example.demo.model.Local;
import com.example.demo.model.Usuario;
import com.example.demo.model.UsuarioLocal;
import com.example.demo.model.UsuarioLocal.UsuarioLocalId;
import com.example.demo.repository.UsuarioLocalRepository;
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
class UsuarioLocalServiceTest {

    @Mock
    private UsuarioLocalRepository usuarioLocalRepository;

    @InjectMocks
    private UsuarioLocalService usuarioLocalService;

    private UsuarioLocal testUsuarioLocal;
    private UsuarioLocalId testId;
    private Usuario testUsuario;
    private Local testLocal;

    @BeforeEach
    void setUp() {
        testUsuario = new Usuario();
        testUsuario.setId(1L);
        testUsuario.setEmail("test@example.com");

        testLocal = new Local();
        testLocal.setId(1L);
        testLocal.setNombre("Test Local");

        testUsuarioLocal = new UsuarioLocal();
        testUsuarioLocal.setUsuario(testUsuario);
        testUsuarioLocal.setLocal(testLocal);

        testId = new UsuarioLocalId();
        testId.setUsuarioId(1L);
        testId.setLocalId(1L);
    }

    @Test
    void testFindAll_ReturnsAllUsuarioLocales() {
        UsuarioLocal ul2 = new UsuarioLocal();
        when(usuarioLocalRepository.findAll()).thenReturn(Arrays.asList(testUsuarioLocal, ul2));

        List<UsuarioLocal> result = usuarioLocalService.findAll();

        assertThat(result).hasSize(2);
        verify(usuarioLocalRepository, times(1)).findAll();
    }

    @Test
    void testFindById_WithExistingId_ReturnsUsuarioLocal() {
        when(usuarioLocalRepository.findById(any(UsuarioLocalId.class)))
                .thenReturn(Optional.of(testUsuarioLocal));

        Optional<UsuarioLocal> result = usuarioLocalService.findById(testId);

        assertThat(result).isPresent();
        verify(usuarioLocalRepository, times(1)).findById(any(UsuarioLocalId.class));
    }

    @Test
    void testFindById_WithNonExistingId_ReturnsEmpty() {
        when(usuarioLocalRepository.findById(any(UsuarioLocalId.class)))
                .thenReturn(Optional.empty());

        Optional<UsuarioLocal> result = usuarioLocalService.findById(testId);

        assertThat(result).isEmpty();
        verify(usuarioLocalRepository, times(1)).findById(any(UsuarioLocalId.class));
    }

    @Test
    void testFindByUsuarioId_ReturnsFilteredList() {
        when(usuarioLocalRepository.findByUsuarioId(1L)).thenReturn(Arrays.asList(testUsuarioLocal));

        List<UsuarioLocal> result = usuarioLocalService.findByUsuarioId(1L);

        assertThat(result).hasSize(1);
        verify(usuarioLocalRepository, times(1)).findByUsuarioId(1L);
    }

    @Test
    void testFindByLocalId_ReturnsFilteredList() {
        when(usuarioLocalRepository.findByLocalId(1L)).thenReturn(Arrays.asList(testUsuarioLocal));

        List<UsuarioLocal> result = usuarioLocalService.findByLocalId(1L);

        assertThat(result).hasSize(1);
        verify(usuarioLocalRepository, times(1)).findByLocalId(1L);
    }

    @Test
    void testSave_CreatesNewUsuarioLocal() {
        when(usuarioLocalRepository.save(any(UsuarioLocal.class))).thenReturn(testUsuarioLocal);

        UsuarioLocal result = usuarioLocalService.save(testUsuarioLocal);

        assertThat(result).isNotNull();
        verify(usuarioLocalRepository, times(1)).save(testUsuarioLocal);
    }

    @Test
    void testDeleteById_DeletesUsuarioLocal() {
        doNothing().when(usuarioLocalRepository).deleteById(any(UsuarioLocalId.class));

        usuarioLocalService.deleteById(testId);

        verify(usuarioLocalRepository, times(1)).deleteById(any(UsuarioLocalId.class));
    }
}