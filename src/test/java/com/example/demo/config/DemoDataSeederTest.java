package com.example.demo.config;

import com.example.demo.controller.AuthController;
import com.example.demo.dto.LoginRequest;
import com.example.demo.model.EstadoPrestamo;
import com.example.demo.model.Reserva;
import com.example.demo.model.ReservaEstado;
import com.example.demo.repository.BandaRepository;
import com.example.demo.repository.ItemRepository;
import com.example.demo.repository.LocalRepository;
import com.example.demo.repository.PrestamoRepository;
import com.example.demo.repository.ReservaRepository;
import com.example.demo.model.Usuario;
import com.example.demo.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

// application.properties fija el dialecto de MySQL, que pisa el de application-test.properties:
// hay que forzar H2 aquí para que se cree el esquema. BD en memoria propia para no
// compartir datos con otros contextos de test.
@SpringBootTest(properties = {
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
        "spring.datasource.url=jdbc:h2:mem:demo-seed;DB_CLOSE_DELAY=-1"
})
@ActiveProfiles({"test", "demo"})
class DemoDataSeederTest {

    @MockitoBean
    private JavaMailSender mailSender;

    @Autowired private DemoDataSeeder seeder;
    @Autowired private AuthController authController;
    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private LocalRepository localRepository;
    @Autowired private BandaRepository bandaRepository;
    @Autowired private ItemRepository itemRepository;
    @Autowired private ReservaRepository reservaRepository;
    @Autowired private PrestamoRepository prestamoRepository;

    @Test
    void seedsTheDemoData() {
        assertEquals(3, usuarioRepository.count());
        assertEquals(1, localRepository.count());
        assertEquals(2, bandaRepository.count());
        assertEquals(6, itemRepository.count());
        assertEquals(1, reservaRepository.count());
        assertEquals(1, prestamoRepository.count());

        Reserva reserva = reservaRepository.findAll().get(0);
        assertEquals(ReservaEstado.CONFIRMADA, reserva.getEstado());
        assertTrue(reserva.getFechaInicio().isAfter(java.time.LocalDateTime.now()),
                "la reserva de demo debe estar en el futuro");
        assertEquals(EstadoPrestamo.ACTIVO, prestamoRepository.findAll().get(0).getEstado());
    }

    @Test
    void everyUserSeesTheirOwnItemsOnTheItemsPage() {
        // La página "Mi Equipamiento" usa GET /api/items/usuario/{id} -> ItemRepository.findByUsuarioId
        for (String email : new String[] {
                DemoDataSeeder.ADMIN_EMAIL, DemoDataSeeder.MEMBER_EMAIL, DemoDataSeeder.GUEST_EMAIL}) {
            Usuario usuario = usuarioRepository.findByEmail(email).orElseThrow();
            assertFalse(itemRepository.findByUsuarioId(usuario.getId()).isEmpty(),
                    email + " debe tener items en su página de equipamiento");
        }
    }

    @Test
    @Transactional // los miembros de la banda se cargan de forma perezosa
    void everyBandHasMembersAndEveryItemHasOneOwner() {
        bandaRepository.findAll().forEach(b -> assertFalse(b.getMiembros().isEmpty()));
        itemRepository.findAll().forEach(i ->
                assertTrue((i.getPropietarioUsuario() == null) != (i.getPropietarioBanda() == null),
                        "el item " + i.getDescripcion() + " debe tener exactamente un propietario"));
    }

    @Test
    void isIdempotent() {
        seeder.run();
        seeder.run();

        assertEquals(3, usuarioRepository.count());
        assertEquals(6, itemRepository.count());
        assertEquals(1, reservaRepository.count());
        assertEquals(1, prestamoRepository.count());
    }

    @Test
    void demoUsersCanLogInWithTheDocumentedPassword() {
        for (String email : new String[] {
                DemoDataSeeder.ADMIN_EMAIL, DemoDataSeeder.MEMBER_EMAIL, DemoDataSeeder.GUEST_EMAIL}) {
            LoginRequest request = new LoginRequest();
            request.setEmail(email);
            request.setContrasenia(DemoDataSeeder.DEMO_PASSWORD);

            ResponseEntity<?> response = authController.login(request);

            assertEquals(HttpStatus.OK, response.getStatusCode(), email);
        }
    }
}
