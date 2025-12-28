package com.example.demo.dto;

import com.example.demo.model.Reserva;
import com.example.demo.model.TipoEvento;

import java.time.LocalDateTime;

public class CalendarEventDTO {
    private Long id;
    private String title;
    private LocalDateTime start;
    private LocalDateTime end;
    private String color;
    private TipoEvento tipo;
    private String estado;
    private String localNombre;
    private String bandaNombre;

    public CalendarEventDTO() {
    }

    public CalendarEventDTO(Reserva reserva) {
        this.id = reserva.getId();
        this.start = reserva.getFechaInicio();
        this.end = reserva.getFechaFin();
        this.color = reserva.getColor();
        this.tipo = reserva.getTipoEvento();
        this.estado = reserva.getEstado().toString();

        switch (reserva.getTipoEvento()) {
            case ENSAYO:
                this.title = (reserva.getBanda() != null ? reserva.getBanda().getNombre() : "Ensayo")
                    + " - " + reserva.getLocal().getNombre();
                this.localNombre = reserva.getLocal().getNombre();
                this.bandaNombre = reserva.getBanda() != null ? reserva.getBanda().getNombre() : null;
                break;
            case SHOW:
                this.title = "Show: " + reserva.getBanda().getNombre();
                this.bandaNombre = reserva.getBanda().getNombre();
                this.localNombre = reserva.getLocal() != null ? reserva.getLocal().getNombre() : null;
                break;
            case SHOW_PERSONAL:
                this.title = "Show Personal";
                this.localNombre = reserva.getLocal() != null ? reserva.getLocal().getNombre() : null;
                break;
        }
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public LocalDateTime getStart() {
        return start;
    }

    public void setStart(LocalDateTime start) {
        this.start = start;
    }

    public LocalDateTime getEnd() {
        return end;
    }

    public void setEnd(LocalDateTime end) {
        this.end = end;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public TipoEvento getTipo() {
        return tipo;
    }

    public void setTipo(TipoEvento tipo) {
        this.tipo = tipo;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getLocalNombre() {
        return localNombre;
    }

    public void setLocalNombre(String localNombre) {
        this.localNombre = localNombre;
    }

    public String getBandaNombre() {
        return bandaNombre;
    }

    public void setBandaNombre(String bandaNombre) {
        this.bandaNombre = bandaNombre;
    }
}
