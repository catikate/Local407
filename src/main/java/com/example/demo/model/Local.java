package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "local")
@JsonIgnoreProperties({"usuarioLocales", "items", "invitaciones"})
public class Local {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @ManyToOne
    @JoinColumn(name = "admin_id", nullable = false)
    private Usuario admin;

    @OneToMany(mappedBy = "local", cascade = CascadeType.ALL)
    private Set<UsuarioLocal> usuarioLocales = new HashSet<>();

    @OneToMany(mappedBy = "local", cascade = CascadeType.ALL)
    private Set<Item> items = new HashSet<>();

    @OneToMany(mappedBy = "local", cascade = CascadeType.ALL)
    private Set<Invitacion> invitaciones = new HashSet<>();

    public Local() {}

    public Local(String nombre, Usuario admin) {
        this.nombre = nombre;
        this.admin = admin;
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

    public Usuario getAdmin() {
        return admin;
    }

    public void setAdmin(Usuario admin) {
        this.admin = admin;
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

    public Set<Invitacion> getInvitaciones() {
        return invitaciones;
    }

    public void setInvitaciones(Set<Invitacion> invitaciones) {
        this.invitaciones = invitaciones;
    }
}