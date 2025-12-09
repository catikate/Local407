package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "item")
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(nullable = false)
    private String descripcion;

    @Column(nullable = false)
    private Integer cantidad;

    @ManyToOne
    @JoinColumn(name = "local_id", nullable = false)
    private Local local;

    @ManyToOne
    @JoinColumn(name = "prestado_a_usuario_id")
    private Usuario prestadoA;

    public Item() {}

    public Item(Usuario usuario, String descripcion, Integer cantidad, Local local) {
        this.usuario = usuario;
        this.descripcion = descripcion;
        this.cantidad = cantidad;
        this.local = local;
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public Integer getCantidad() {
        return cantidad;
    }

    public void setCantidad(Integer cantidad) {
        this.cantidad = cantidad;
    }

    public Local getLocal() {
        return local;
    }

    public void setLocal(Local local) {
        this.local = local;
    }

    public Usuario getPrestadoA() {
        return prestadoA;
    }

    public void setPrestadoA(Usuario prestadoA) {
        this.prestadoA = prestadoA;
    }
}