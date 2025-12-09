package com.example.demo.dto;

public class AuthResponse {
    private String token;
    private String email;
    private String nombre;
    private String apellido;
    private Long id;

    public AuthResponse() {}

    public AuthResponse(String token, String email, String nombre, String apellido, Long id) {
        this.token = token;
        this.email = email;
        this.nombre = nombre;
        this.apellido = apellido;
        this.id = id;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getApellido() {
        return apellido;
    }

    public void setApellido(String apellido) {
        this.apellido = apellido;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
}