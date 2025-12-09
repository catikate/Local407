package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "usuario")
@JsonIgnoreProperties({"localesAdministrados", "usuarioLocales", "items", "invitacionesEnviadas", "invitacionesRecibidas"})
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private String apellido;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String contrasenia;

    @OneToMany(mappedBy = "admin", cascade = CascadeType.ALL)
    private Set<Local> localesAdministrados = new HashSet<>();

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL)
    private Set<UsuarioLocal> usuarioLocales = new HashSet<>();

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL)
    private Set<Item> items = new HashSet<>();

    @OneToMany(mappedBy = "de", cascade = CascadeType.ALL)
    private Set<Invitacion> invitacionesEnviadas = new HashSet<>();

    @OneToMany(mappedBy = "a", cascade = CascadeType.ALL)
    private Set<Invitacion> invitacionesRecibidas = new HashSet<>();

    public Usuario() {}

    public Usuario(String nombre, String apellido, String email, String contrasenia) {
        this.nombre = nombre;
        this.apellido = apellido;
        this.email = email;
        this.contrasenia = contrasenia;
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getContrasenia() {
        return contrasenia;
    }

    public void setContrasenia(String contrasenia) {
        this.contrasenia = contrasenia;
    }

    public Set<Local> getLocalesAdministrados() {
        return localesAdministrados;
    }

    public void setLocalesAdministrados(Set<Local> localesAdministrados) {
        this.localesAdministrados = localesAdministrados;
    }

    public Set<UsuarioLocal> getUsuarioLocales() {
        return usuarioLocales;
    }

    public void setUsuarioLocales(Set<UsuarioLocal> usuarioLocales) {
        this.usuarioLocales = usuarioLocales;
    }

    public Set<Item> getItems() {
        return items;
    }

    public void setItems(Set<Item> items) {
        this.items = items;
    }

    public Set<Invitacion> getInvitacionesEnviadas() {
        return invitacionesEnviadas;
    }

    public void setInvitacionesEnviadas(Set<Invitacion> invitacionesEnviadas) {
        this.invitacionesEnviadas = invitacionesEnviadas;
    }

    public Set<Invitacion> getInvitacionesRecibidas() {
        return invitacionesRecibidas;
    }

    public void setInvitacionesRecibidas(Set<Invitacion> invitacionesRecibidas) {
        this.invitacionesRecibidas = invitacionesRecibidas;
    }
}