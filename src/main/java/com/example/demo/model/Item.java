package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
@Table(name = "item")
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String descripcion;

    @Column(nullable = false)
    private Integer cantidad;

    // Propietario: puede ser Usuario o Banda (uno de los dos debe ser NOT NULL)
    @ManyToOne
    @JoinColumn(name = "propietario_usuario_id")
    @JsonIgnoreProperties({"items", "bandas", "reservas", "usuarioLocales", "invitaciones", "contrasenia"})
    private Usuario propietarioUsuario;

    @ManyToOne
    @JoinColumn(name = "propietario_banda_id")
    @JsonIgnoreProperties({"items", "miembros", "local"})
    private Banda propietarioBanda;

    // Ubicación: local original (donde debe volver) y local actual (donde está ahora)
    @ManyToOne
    @JoinColumn(name = "local_original_id", nullable = false)
    @JsonIgnoreProperties({"items", "bandas", "usuarioLocales", "reservas"})
    private Local localOriginal;

    @ManyToOne
    @JoinColumn(name = "local_actual_id", nullable = false)
    @JsonIgnoreProperties({"items", "bandas", "usuarioLocales", "reservas"})
    private Local localActual;

    // Campo deprecated - usar localOriginal/localActual en su lugar
    @Deprecated
    @ManyToOne
    @JoinColumn(name = "local_id")
    private Local local;

    // Campo deprecated - usar entidad Prestamo en su lugar
    @Deprecated
    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Deprecated
    @ManyToOne
    @JoinColumn(name = "prestado_a_usuario_id")
    private Usuario prestadoA;

    public Item() {}

    // Constructor con propietario Usuario
    public Item(Usuario propietarioUsuario, String descripcion, Integer cantidad, Local local) {
        this.propietarioUsuario = propietarioUsuario;
        this.descripcion = descripcion;
        this.cantidad = cantidad;
        this.localOriginal = local;
        this.localActual = local;
    }

    // Constructor con propietario Banda
    public Item(Banda propietarioBanda, String descripcion, Integer cantidad, Local local) {
        this.propietarioBanda = propietarioBanda;
        this.descripcion = descripcion;
        this.cantidad = cantidad;
        this.localOriginal = local;
        this.localActual = local;
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Usuario getPropietarioUsuario() {
        return propietarioUsuario;
    }

    public void setPropietarioUsuario(Usuario propietarioUsuario) {
        this.propietarioUsuario = propietarioUsuario;
        // Mantener compatibilidad con campo deprecated
        this.usuario = propietarioUsuario;
    }

    public Banda getPropietarioBanda() {
        return propietarioBanda;
    }

    public void setPropietarioBanda(Banda propietarioBanda) {
        this.propietarioBanda = propietarioBanda;
    }

    public Local getLocalOriginal() {
        return localOriginal;
    }

    public void setLocalOriginal(Local localOriginal) {
        this.localOriginal = localOriginal;
        // Mantener compatibilidad con campo deprecated
        this.local = localOriginal;
    }

    public Local getLocalActual() {
        return localActual;
    }

    public void setLocalActual(Local localActual) {
        this.localActual = localActual;
    }

    @Deprecated
    public Local getLocal() {
        return local;
    }

    @Deprecated
    public void setLocal(Local local) {
        this.local = local;
    }

    @Deprecated
    public Usuario getUsuario() {
        return usuario;
    }

    @Deprecated
    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    @Deprecated
    public Usuario getPrestadoA() {
        return prestadoA;
    }

    @Deprecated
    public void setPrestadoA(Usuario prestadoA) {
        this.prestadoA = prestadoA;
    }

    // Helper methods
    public boolean isPrestado() {
        return !localOriginal.getId().equals(localActual.getId());
    }

    public String getPropietarioNombre() {
        if (propietarioUsuario != null) {
            return propietarioUsuario.getNombre() + " " + propietarioUsuario.getApellido();
        } else if (propietarioBanda != null) {
            return propietarioBanda.getNombre();
        }
        return "Sin propietario";
    }
}