package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;

@Entity
@Table(name = "usuario_local")
@JsonIgnoreProperties({"local"})
public class UsuarioLocal {

    @EmbeddedId
    private UsuarioLocalId id;

    @ManyToOne
    @MapsId("usuarioId")
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @ManyToOne
    @MapsId("localId")
    @JoinColumn(name = "local_id")
    private Local local;

    public UsuarioLocal() {}

    public UsuarioLocal(Usuario usuario, Local local) {
        this.usuario = usuario;
        this.local = local;
        this.id = new UsuarioLocalId(usuario.getId(), local.getId());
    }

    // Getters and Setters

    public UsuarioLocalId getId() {
        return id;
    }

    public void setId(UsuarioLocalId id) {
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

    @Embeddable
    public static class UsuarioLocalId implements Serializable {

        @Column(name = "usuario_id")
        private Long usuarioId;

        @Column(name = "local_id")
        private Long localId;

        public UsuarioLocalId() {}

        public UsuarioLocalId(Long usuarioId, Long localId) {
            this.usuarioId = usuarioId;
            this.localId = localId;
        }

        public Long getUsuarioId() {
            return usuarioId;
        }

        public void setUsuarioId(Long usuarioId) {
            this.usuarioId = usuarioId;
        }

        public Long getLocalId() {
            return localId;
        }

        public void setLocalId(Long localId) {
            this.localId = localId;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            UsuarioLocalId that = (UsuarioLocalId) o;
            return Objects.equals(usuarioId, that.usuarioId) &&
                   Objects.equals(localId, that.localId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(usuarioId, localId);
        }
    }
}