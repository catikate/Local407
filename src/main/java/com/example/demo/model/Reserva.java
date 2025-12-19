package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reserva")
public class Reserva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    @JsonIgnoreProperties({"localesAdministrados", "usuarioLocales", "items", "invitacionesEnviadas", "invitacionesRecibidas", "reservas"})
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "local_id", nullable = false)
    @JsonIgnoreProperties({"admin", "usuarioLocales", "items", "invitaciones", "reservas"})
    private Local local;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDateTime fechaInicio;

    @Column(name = "fecha_fin", nullable = false)
    private LocalDateTime fechaFin;

    @Column(name = "es_reserva_dia_completo", nullable = false)
    private Boolean esReservaDiaCompleto = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReservaEstado estado;

    @Column(length = 500)
    private String notas;

    public Reserva() {
    }

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

    public Local getLocal() {
        return local;
    }

    public void setLocal(Local local) {
        this.local = local;
    }

    public LocalDateTime getFechaInicio() {
        return fechaInicio;
    }

    public void setFechaInicio(LocalDateTime fechaInicio) {
        this.fechaInicio = fechaInicio;
    }

    public LocalDateTime getFechaFin() {
        return fechaFin;
    }

    public void setFechaFin(LocalDateTime fechaFin) {
        this.fechaFin = fechaFin;
    }

    public Boolean getEsReservaDiaCompleto() {
        return esReservaDiaCompleto;
    }

    public void setEsReservaDiaCompleto(Boolean esReservaDiaCompleto) {
        this.esReservaDiaCompleto = esReservaDiaCompleto;
    }

    public ReservaEstado getEstado() {
        return estado;
    }

    public void setEstado(ReservaEstado estado) {
        this.estado = estado;
    }

    public String getNotas() {
        return notas;
    }

    public void setNotas(String notas) {
        this.notas = notas;
    }
}