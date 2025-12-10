package com.example.demo.service;

import com.example.demo.model.Usuario;
import com.example.demo.repository.UsuarioRepository;
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
class UsuarioServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private UsuarioService usuarioService;

    private Usuario testUser;

    @BeforeEach
    void setUp() {
        testUser = new Usuario();
        testUser.setId(1L);
        testUser.setNombre("Test");
        testUser.setApellido("User");
        testUser.setEmail("test@example.com");
        testUser.setContrasenia("password");
    }

    @Test
    void testFindAll_ReturnsAllUsuarios() {
        Usuario user2 = new Usuario();
        user2.setId(2L);
        user2.setEmail("user2@example.com");
        
        when(usuarioRepository.findAll()).thenReturn(Arrays.asList(testUser, user2));
        
        List<Usuario> result = usuarioService.findAll();
        
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getEmail()).isEqualTo("test@example.com");
        verify(usuarioRepository, times(1)).findAll();
    }

    @Test
    void testFindById_WithExistingId_ReturnsUsuario() {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(testUser));
        
        Optional<Usuario> result = usuarioService.findById(1L);
        
        assertThat(result).isPresent();
        assertThat(result.get().getEmail()).isEqualTo("test@example.com");
        verify(usuarioRepository, times(1)).findById(1L);
    }

    @Test
    void testFindById_WithNonExistingId_ReturnsEmpty() {
        when(usuarioRepository.findById(999L)).thenReturn(Optional.empty());
        
        Optional<Usuario> result = usuarioService.findById(999L);
        
        assertThat(result).isEmpty();
        verify(usuarioRepository, times(1)).findById(999L);
    }

    @Test
    void testFindByEmail_WithExistingEmail_ReturnsUsuario() {
        when(usuarioRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        
        Optional<Usuario> result = usuarioService.findByEmail("test@example.com");
        
        assertThat(result).isPresent();
        assertThat(result.get().getNombre()).isEqualTo("Test");
        verify(usuarioRepository, times(1)).findByEmail("test@example.com");
    }

    @Test
    void testSave_CreatesNewUsuario() {
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(testUser);
        
        Usuario result = usuarioService.save(testUser);
        
        assertThat(result).isNotNull();
        assertThat(result.getEmail()).isEqualTo("test@example.com");
        verify(usuarioRepository, times(1)).save(testUser);
    }

    @Test
    void testDeleteById_DeletesUsuario() {
        doNothing().when(usuarioRepository).deleteById(1L);
        
        usuarioService.deleteById(1L);
        
        verify(usuarioRepository, times(1)).deleteById(1L);
    }
}
