package com.example.demo.service;

import com.example.demo.model.Local;
import com.example.demo.repository.LocalRepository;
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
class LocalServiceTest {

    @Mock
    private LocalRepository localRepository;

    @InjectMocks
    private LocalService localService;

    private Local testLocal;

    @BeforeEach
    void setUp() {
        testLocal = new Local();
        testLocal.setId(1L);
        testLocal.setNombre("Test Local");
    }

    @Test
    void testFindAll_ReturnsAllLocales() {
        Local local2 = new Local();
        local2.setId(2L);
        local2.setNombre("Local 2");

        when(localRepository.findAll()).thenReturn(Arrays.asList(testLocal, local2));

        List<Local> result = localService.findAll();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getNombre()).isEqualTo("Test Local");
        verify(localRepository, times(1)).findAll();
    }

    @Test
    void testFindById_WithExistingId_ReturnsLocal() {
        when(localRepository.findById(1L)).thenReturn(Optional.of(testLocal));

        Optional<Local> result = localService.findById(1L);

        assertThat(result).isPresent();
        assertThat(result.get().getNombre()).isEqualTo("Test Local");
        verify(localRepository, times(1)).findById(1L);
    }

    @Test
    void testFindById_WithNonExistingId_ReturnsEmpty() {
        when(localRepository.findById(999L)).thenReturn(Optional.empty());

        Optional<Local> result = localService.findById(999L);

        assertThat(result).isEmpty();
        verify(localRepository, times(1)).findById(999L);
    }

    @Test
    void testFindByAdminId_ReturnsFilteredLocales() {
        when(localRepository.findByAdminId(1L)).thenReturn(Arrays.asList(testLocal));

        List<Local> result = localService.findByAdminId(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getNombre()).isEqualTo("Test Local");
        verify(localRepository, times(1)).findByAdminId(1L);
    }

    @Test
    void testSave_CreatesNewLocal() {
        when(localRepository.save(any(Local.class))).thenReturn(testLocal);

        Local result = localService.save(testLocal);

        assertThat(result).isNotNull();
        assertThat(result.getNombre()).isEqualTo("Test Local");
        verify(localRepository, times(1)).save(testLocal);
    }

    @Test
    void testDeleteById_DeletesLocal() {
        doNothing().when(localRepository).deleteById(1L);

        localService.deleteById(1L);

        verify(localRepository, times(1)).deleteById(1L);
    }
}