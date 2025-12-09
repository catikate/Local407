package com.example.demo.controller;

import com.example.demo.dto.AuthResponse;
import com.example.demo.dto.LoginRequest;
import com.example.demo.model.Usuario;
import com.example.demo.security.JwtUtil;
import com.example.demo.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        Optional<Usuario> usuarioOpt = usuarioService.findByEmail(loginRequest.getEmail());

        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Usuario no encontrado");
        }

        Usuario usuario = usuarioOpt.get();

        if (!usuario.getContrasenia().equals(loginRequest.getContrasenia())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Contraseña incorrecta");
        }

        String token = jwtUtil.generateToken(usuario.getEmail());

        AuthResponse response = new AuthResponse(
                token,
                usuario.getEmail(),
                usuario.getNombre(),
                usuario.getApellido(),
                usuario.getId()
        );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Usuario usuario) {
        Optional<Usuario> existingUser = usuarioService.findByEmail(usuario.getEmail());

        if (existingUser.isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("El email ya está registrado");
        }

        Usuario savedUsuario = usuarioService.save(usuario);

        String token = jwtUtil.generateToken(savedUsuario.getEmail());

        AuthResponse response = new AuthResponse(
                token,
                savedUsuario.getEmail(),
                savedUsuario.getNombre(),
                savedUsuario.getApellido(),
                savedUsuario.getId()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}