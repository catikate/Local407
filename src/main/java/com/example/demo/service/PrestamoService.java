package com.example.demo.service;

import com.example.demo.model.*;
import com.example.demo.repository.PrestamoRepository;
import com.example.demo.repository.ItemRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PrestamoService {

    private static final Logger log = LoggerFactory.getLogger(PrestamoService.class);

    @Autowired
    private PrestamoRepository prestamoRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private NotificacionService notificationService;

    public List<Prestamo> findAll() {
        return prestamoRepository.findAll();
    }

    public Optional<Prestamo> findById(Long id) {
        return prestamoRepository.findById(id);
    }

    public List<Prestamo> findByItemId(Long itemId) {
        return prestamoRepository.findByItemId(itemId);
    }

    public List<Prestamo> findByPrestadoPorId(Long usuarioId) {
        return prestamoRepository.findByPrestadoPorId(usuarioId);
    }

    public List<Prestamo> findByPrestadoAUsuarioId(Long usuarioId) {
        return prestamoRepository.findByPrestadoAUsuarioId(usuarioId);
    }

    public List<Prestamo> findByPrestadoABandaId(Long bandaId) {
        return prestamoRepository.findByPrestadoABandaId(bandaId);
    }

    public List<Prestamo> findByEstado(EstadoPrestamo estado) {
        return prestamoRepository.findByEstado(estado);
    }

    public List<Prestamo> findVencidos() {
        return prestamoRepository.findVencidos(EstadoPrestamo.ACTIVO, LocalDateTime.now());
    }

    @Transactional
    public Prestamo crearPrestamo(Prestamo prestamo) {
        // Cargar el item completo de la base de datos
        Item item = itemRepository.findById(prestamo.getItem().getId())
                .orElseThrow(() -> new IllegalArgumentException("Item no encontrado"));

        // Asignar el item completo al préstamo
        prestamo.setItem(item);

        // Validar que el item no esté ya prestado
        List<Prestamo> prestamosActivos = prestamoRepository.findByItemId(item.getId())
                .stream()
                .filter(p -> p.getEstado() == EstadoPrestamo.ACTIVO)
                .toList();

        if (!prestamosActivos.isEmpty()) {
            throw new IllegalStateException("El item ya está prestado activamente");
        }

        // Validar que tenga receptor (Usuario o Banda)
        if (prestamo.getPrestadoAUsuario() == null && prestamo.getPrestadoABanda() == null) {
            throw new IllegalArgumentException("Debe especificar un receptor (usuario o banda)");
        }

        // Si el préstamo es a otro local, actualizar localActual del item
        if (prestamo.esPrestamoDiferrenteLocal()) {
            item.setLocalActual(prestamo.getLocalDestino());
            itemRepository.save(item);
        }

        Prestamo savedPrestamo = prestamoRepository.save(prestamo);

        // Crear notificación para el propietario del item
        try {
            notificationService.notificarSolicitudPrestamo(savedPrestamo);
            log.info("Notificación de préstamo creada para el préstamo ID: {}", savedPrestamo.getId());
        } catch (Exception e) {
            log.error("Error creando notificación de préstamo: {}", e.getMessage());
        }

        return savedPrestamo;
    }

    @Transactional
    public Prestamo devolverPrestamo(Long prestamoId) {
        Prestamo prestamo = prestamoRepository.findById(prestamoId)
                .orElseThrow(() -> new IllegalArgumentException("Préstamo no encontrado"));

        if (prestamo.getEstado() != EstadoPrestamo.ACTIVO) {
            throw new IllegalStateException("El préstamo no está activo");
        }

        prestamo.marcarComoDevuelto();
        itemRepository.save(prestamo.getItem());

        Prestamo updated = prestamoRepository.save(prestamo);

        // Notificar devolución al propietario
        try {
            Usuario propietario = updated.getItem().getPropietarioUsuario();
            if (propietario != null) {
                notificationService.crearNotificacion(
                    propietario,
                    TipoNotificacion.ITEM_LOAN_APPROVED,
                    "✅ Item Devuelto",
                    String.format("%s devolvió: %s",
                        updated.getPrestadoPor().getNombre(),
                        updated.getItem().getDescripcion()
                    ),
                    "/prestamos/" + updated.getId(),
                    PrioridadNotificacion.NORMAL,
                    false
                );
            }
            log.info("Notificación de devolución enviada");
        } catch (Exception e) {
            log.error("Error enviando notificación de devolución: {}", e.getMessage());
        }

        return updated;
    }

    @Transactional
    public void actualizarPrestamosVencidos() {
        List<Prestamo> vencidos = findVencidos();
        for (Prestamo prestamo : vencidos) {
            prestamo.setEstado(EstadoPrestamo.VENCIDO);
            prestamoRepository.save(prestamo);
        }
    }

    public Prestamo save(Prestamo prestamo) {
        return prestamoRepository.save(prestamo);
    }

    @Transactional
    public Prestamo actualizarPrestamo(Prestamo existingPrestamo, Prestamo newPrestamo) {
        EstadoPrestamo oldEstado = existingPrestamo.getEstado();
        EstadoPrestamo newEstado = newPrestamo.getEstado();

        // Actualizar préstamo
        Prestamo updated = prestamoRepository.save(newPrestamo);

        // Notificar cuando el item es devuelto
        if (oldEstado != newEstado && newEstado == EstadoPrestamo.DEVUELTO) {
            try {
                Usuario propietario = updated.getItem().getPropietarioUsuario();
                if (propietario != null) {
                    notificationService.crearNotificacion(
                        propietario,
                        TipoNotificacion.ITEM_LOAN_APPROVED,
                        "✅ Item Devuelto",
                        String.format("%s devolvió: %s",
                            updated.getPrestadoPor().getNombre(),
                            updated.getItem().getDescripcion()
                        ),
                        "/prestamos/" + updated.getId(),
                        PrioridadNotificacion.NORMAL,
                        false
                    );
                }
                log.info("Notificación de devolución enviada");
            } catch (Exception e) {
                log.error("Error enviando notificación de devolución: {}", e.getMessage());
            }
        }

        return updated;
    }

    public void deleteById(Long id) {
        prestamoRepository.deleteById(id);
    }
}