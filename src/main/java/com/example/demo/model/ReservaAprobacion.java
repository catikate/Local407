package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reserva_aprobacion")
public class ReservaAprobacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "reserva_id", nullable = false)
    @JsonIgnoreProperties({"usuario", "local"})
    private Reserva reserva;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    @JsonIgnoreProperties({"localesAdministrados", "usuarioLocales", "items", "invitacionesEnviadas", "invitacionesRecibidas", "reservas"})
    private Usuario usuario;

    @Column(nullable = true)
    private Boolean aprobada;  // null = pendiente, true = aprobada, false = rechazada

    @Column(name = "fecha_respuesta")
    private LocalDateTime fechaRespuesta;

    public ReservaAprobacion() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Reserva getReserva() {
        return reserva;
    }

    public void setReserva(Reserva reserva) {
        this.reserva = reserva;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public Boolean getAprobada() {
        return aprobada;
    }

    public void setAprobada(Boolean aprobada) {
        this.aprobada = aprobada;
    }

    public LocalDateTime getFechaRespuesta() {
        return fechaRespuesta;
    }

    public void setFechaRespuesta(LocalDateTime fechaRespuesta) {
        this.fechaRespuesta = fechaRespuesta;
    }
}