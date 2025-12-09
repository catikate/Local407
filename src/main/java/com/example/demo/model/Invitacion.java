package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "invitacion")
public class Invitacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "de_usuario_id", nullable = false)
    private Usuario de;

    @ManyToOne
    @JoinColumn(name = "a_usuario_id", nullable = false)
    private Usuario a;

    @ManyToOne
    @JoinColumn(name = "local_id", nullable = false)
    private Local local;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InvitacionEstado estado = InvitacionEstado.PENDIENTE;

    public Invitacion() {}

    public Invitacion(Usuario de, Usuario a, Local local) {
        this.de = de;
        this.a = a;
        this.local = local;
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Usuario getDe() {
        return de;
    }

    public void setDe(Usuario de) {
        this.de = de;
    }

    public Usuario getA() {
        return a;
    }

    public void setA(Usuario a) {
        this.a = a;
    }

    public Local getLocal() {
        return local;
    }

    public void setLocal(Local local) {
        this.local = local;
    }

    public InvitacionEstado getEstado() {
        return estado;
    }

    public void setEstado(InvitacionEstado estado) {
        this.estado = estado;
    }
}