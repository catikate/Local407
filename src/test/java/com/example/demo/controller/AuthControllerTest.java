package com.example.demo.controller;

import com.example.demo.dto.LoginRequest;
import com.example.demo.model.Usuario;
import com.example.demo.security.JwtUtil;
import com.example.demo.service.UsuarioService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private UsuarioService usuarioService;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthController authController;

    private Usuario testUser;
    private LoginRequest loginRequest;
    private static final String TEST_TOKEN = "test.jwt.token";

    @BeforeEach
    void setUp() {
        testUser = new Usuario();
        testUser.setId(1L);
        testUser.setNombre("Test");
        testUser.setApellido("User");
        testUser.setEmail("test@example.com");
        testUser.setContrasenia("password123");

        loginRequest = new LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setContrasenia("password123");
    }

    @Test
    void testLogin_WithValidCredentials_ReturnsAuthResponse() {
        when(usuarioService.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(jwtUtil.generateToken("test@example.com")).thenReturn(TEST_TOKEN);

        ResponseEntity<?> response = authController.login(loginRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(usuarioService, times(1)).findByEmail("test@example.com");
        verify(jwtUtil, times(1)).generateToken("test@example.com");
    }

    @Test
    void testLogin_WithNonExistentUser_ReturnsUnauthorized() {
        when(usuarioService.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

        loginRequest.setEmail("nonexistent@example.com");
        ResponseEntity<?> response = authController.login(loginRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(response.getBody()).isEqualTo("Usuario no encontrado");
        verify(usuarioService, times(1)).findByEmail("nonexistent@example.com");
        verify(jwtUtil, never()).generateToken(anyString());
    }

    @Test
    void testLogin_WithWrongPassword_ReturnsUnauthorized() {
        when(usuarioService.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        loginRequest.setContrasenia("wrongpassword");
        ResponseEntity<?> response = authController.login(loginRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(response.getBody()).isEqualTo("Contraseña incorrecta");
        verify(usuarioService, times(1)).findByEmail("test@example.com");
        verify(jwtUtil, never()).generateToken(anyString());
    }

    @Test
    void testRegister_WithNewUser_ReturnsCreatedAndAuthResponse() {
        Usuario newUser = new Usuario();
        newUser.setNombre("New");
        newUser.setApellido("User");
        newUser.setEmail("new@example.com");
        newUser.setContrasenia("newpassword");

        Usuario savedUser = new Usuario();
        savedUser.setId(2L);
        savedUser.setNombre("New");
        savedUser.setApellido("User");
        savedUser.setEmail("new@example.com");
        savedUser.setContrasenia("newpassword");

        when(usuarioService.findByEmail("new@example.com")).thenReturn(Optional.empty());
        when(usuarioService.save(any(Usuario.class))).thenReturn(savedUser);
        when(jwtUtil.generateToken("new@example.com")).thenReturn(TEST_TOKEN);

        ResponseEntity<?> response = authController.register(newUser);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        verify(usuarioService, times(1)).findByEmail("new@example.com");
        verify(usuarioService, times(1)).save(any(Usuario.class));
        verify(jwtUtil, times(1)).generateToken("new@example.com");
    }

    @Test
    void testRegister_WithExistingEmail_ReturnsBadRequest() {
        when(usuarioService.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        ResponseEntity<?> response = authController.register(testUser);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isEqualTo("El email ya está registrado");
        verify(usuarioService, times(1)).findByEmail("test@example.com");
        verify(usuarioService, never()).save(any(Usuario.class));
        verify(jwtUtil, never()).generateToken(anyString());
    }
}