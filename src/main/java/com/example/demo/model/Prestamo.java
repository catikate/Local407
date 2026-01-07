package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "prestamo")
public class Prestamo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "item_id", nullable = false)
    @JsonIgnoreProperties({"prestamos", "propietarioUsuario", "propietarioBanda", "usuario", "prestadoA", "local"})
    private Item item;

    @ManyToOne
    @JoinColumn(name = "prestado_por_id", nullable = false)
    @JsonIgnoreProperties({"items", "bandas", "reservas", "usuarioLocales", "invitaciones", "contrasenia", "prestamos"})
    private Usuario prestadoPor;

    // Receptor: puede ser Usuario o Banda (uno de los dos debe ser NOT NULL)
    @ManyToOne
    @JoinColumn(name = "prestado_a_usuario_id")
    @JsonIgnoreProperties({"items", "bandas", "reservas", "usuarioLocales", "invitaciones", "contrasenia", "prestamos"})
    private Usuario prestadoAUsuario;

    @ManyToOne
    @JoinColumn(name = "prestado_a_banda_id")
    @JsonIgnoreProperties({"items", "miembros", "local", "prestamos"})
    private Banda prestadoABanda;

    @ManyToOne
    @JoinColumn(name = "local_origen_id", nullable = false)
    @JsonIgnoreProperties({"items", "bandas", "usuarioLocales", "reservas", "prestamos"})
    private Local localOrigen;

    @ManyToOne
    @JoinColumn(name = "local_destino_id", nullable = false)
    @JsonIgnoreProperties({"items", "bandas", "usuarioLocales", "reservas", "prestamos"})
    private Local localDestino;

    @Column(nullable = false)
    private LocalDateTime fechaPrestamo;

    @Column(nullable = false)
    private LocalDateTime fechaDevolucionEsperada;

    @Column
    private LocalDateTime fechaDevolucionReal;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoPrestamo estado;

    @Column(length = 500)
    private String notas;

    public Prestamo() {
        this.fechaPrestamo = LocalDateTime.now();
        this.estado = EstadoPrestamo.ACTIVO;
    }

    public Prestamo(Item item, Usuario prestadoPor, LocalDateTime fechaDevolucionEsperada) {
        this();
        this.item = item;
        this.prestadoPor = prestadoPor;
        this.fechaDevolucionEsperada = fechaDevolucionEsperada;
        this.localOrigen = item.getLocalOriginal();
        this.localDestino = item.getLocalActual();
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Item getItem() {
        return item;
    }

    public void setItem(Item item) {
        this.item = item;
    }

    public Usuario getPrestadoPor() {
        return prestadoPor;
    }

    public void setPrestadoPor(Usuario prestadoPor) {
        this.prestadoPor = prestadoPor;
    }

    public Usuario getPrestadoAUsuario() {
        return prestadoAUsuario;
    }

    public void setPrestadoAUsuario(Usuario prestadoAUsuario) {
        this.prestadoAUsuario = prestadoAUsuario;
    }

    public Banda getPrestadoABanda() {
        return prestadoABanda;
    }

    public void setPrestadoABanda(Banda prestadoABanda) {
        this.prestadoABanda = prestadoABanda;
    }

    public Local getLocalOrigen() {
        return localOrigen;
    }

    public void setLocalOrigen(Local localOrigen) {
        this.localOrigen = localOrigen;
    }

    public Local getLocalDestino() {
        return localDestino;
    }

    public void setLocalDestino(Local localDestino) {
        this.localDestino = localDestino;
    }

    public LocalDateTime getFechaPrestamo() {
        return fechaPrestamo;
    }

    public void setFechaPrestamo(LocalDateTime fechaPrestamo) {
        this.fechaPrestamo = fechaPrestamo;
    }

    public LocalDateTime getFechaDevolucionEsperada() {
        return fechaDevolucionEsperada;
    }

    public void setFechaDevolucionEsperada(LocalDateTime fechaDevolucionEsperada) {
        this.fechaDevolucionEsperada = fechaDevolucionEsperada;
    }

    public LocalDateTime getFechaDevolucionReal() {
        return fechaDevolucionReal;
    }

    public void setFechaDevolucionReal(LocalDateTime fechaDevolucionReal) {
        this.fechaDevolucionReal = fechaDevolucionReal;
    }

    public EstadoPrestamo getEstado() {
        return estado;
    }

    public void setEstado(EstadoPrestamo estado) {
        this.estado = estado;
    }

    public String getNotas() {
        return notas;
    }

    public void setNotas(String notas) {
        this.notas = notas;
    }

    // Helper methods

    public boolean isVencido() {
        return estado == EstadoPrestamo.ACTIVO &&
               LocalDateTime.now().isAfter(fechaDevolucionEsperada);
    }

    public boolean esPrestamoDiferrenteLocal() {
        return !localOrigen.getId().equals(localDestino.getId());
    }

    public String getReceptorNombre() {
        if (prestadoAUsuario != null) {
            return prestadoAUsuario.getNombre() + " " + prestadoAUsuario.getApellido();
        } else if (prestadoABanda != null) {
            return "Banda: " + prestadoABanda.getNombre();
        }
        return "Sin receptor";
    }

    public void marcarComoDevuelto() {
        this.estado = EstadoPrestamo.DEVUELTO;
        this.fechaDevolucionReal = LocalDateTime.now();

        // Restaurar ubicación del item a su local original
        if (this.item != null) {
            this.item.setLocalActual(this.item.getLocalOriginal());
        }
    }
}