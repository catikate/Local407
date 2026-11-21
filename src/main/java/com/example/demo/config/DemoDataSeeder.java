package com.example.demo.config;

import com.example.demo.model.Banda;
import com.example.demo.model.EstadoPrestamo;
import com.example.demo.model.Item;
import com.example.demo.model.Local;
import com.example.demo.model.Prestamo;
import com.example.demo.model.Reserva;
import com.example.demo.model.ReservaEstado;
import com.example.demo.model.TipoEvento;
import com.example.demo.model.Usuario;
import com.example.demo.model.UsuarioLocal;
import com.example.demo.repository.BandaRepository;
import com.example.demo.repository.ItemRepository;
import com.example.demo.repository.LocalRepository;
import com.example.demo.repository.PrestamoRepository;
import com.example.demo.repository.ReservaRepository;
import com.example.demo.repository.UsuarioLocalRepository;
import com.example.demo.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Datos de demostración. Solo se ejecuta con el perfil "demo"
 * (SPRING_PROFILES_ACTIVE=demo) y es idempotente: si el usuario de demo
 * ya existe no hace nada.
 *
 * Nota: el login compara la contraseña en texto plano, así que los usuarios
 * se guardan igual que lo haría /api/auth/register.
 */
@Component
@Profile("demo")
public class DemoDataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoDataSeeder.class);

    public static final String DEMO_PASSWORD = "demo1234";
    public static final String ADMIN_EMAIL = "ana@local407.demo";
    public static final String MEMBER_EMAIL = "bruno@local407.demo";
    public static final String GUEST_EMAIL = "carla@local407.demo";

    private final UsuarioRepository usuarioRepository;
    private final LocalRepository localRepository;
    private final UsuarioLocalRepository usuarioLocalRepository;
    private final BandaRepository bandaRepository;
    private final ItemRepository itemRepository;
    private final ReservaRepository reservaRepository;
    private final PrestamoRepository prestamoRepository;
    private final TransactionTemplate transactionTemplate;

    public DemoDataSeeder(UsuarioRepository usuarioRepository,
                          LocalRepository localRepository,
                          UsuarioLocalRepository usuarioLocalRepository,
                          BandaRepository bandaRepository,
                          ItemRepository itemRepository,
                          ReservaRepository reservaRepository,
                          PrestamoRepository prestamoRepository,
                          PlatformTransactionManager transactionManager) {
        this.usuarioRepository = usuarioRepository;
        this.localRepository = localRepository;
        this.usuarioLocalRepository = usuarioLocalRepository;
        this.bandaRepository = bandaRepository;
        this.itemRepository = itemRepository;
        this.reservaRepository = reservaRepository;
        this.prestamoRepository = prestamoRepository;
        this.transactionTemplate = new TransactionTemplate(transactionManager);
    }

    @Override
    public void run(String... args) {
        if (usuarioRepository.findByEmail(ADMIN_EMAIL).isPresent()) {
            log.info("Demo data already present, skipping seed");
            return;
        }
        // Todo o nada: si algo falla no queda una demo a medias
        transactionTemplate.executeWithoutResult(status -> seed());
        log.info("Demo data created (users: {}, {}, {}; password: {})",
                ADMIN_EMAIL, MEMBER_EMAIL, GUEST_EMAIL, DEMO_PASSWORD);
    }

    private void seed() {
        // 3 usuarios
        Usuario ana = usuarioRepository.save(new Usuario("Ana", "García", ADMIN_EMAIL, DEMO_PASSWORD));
        Usuario bruno = usuarioRepository.save(new Usuario("Bruno", "Martínez", MEMBER_EMAIL, DEMO_PASSWORD));
        Usuario carla = usuarioRepository.save(new Usuario("Carla", "López", GUEST_EMAIL, DEMO_PASSWORD));

        // 1 local, con los 3 usuarios como miembros
        Local local = new Local("Local 407", ana);
        local.setColor("#4CAF50");
        local = localRepository.save(local);
        for (Usuario u : new Usuario[] {ana, bruno, carla}) {
            usuarioLocalRepository.save(new UsuarioLocal(u, local));
        }

        // 2 bandas
        Banda reverb = banda("Los Reverb", "Rock alternativo, ensayan los martes", "#2196F3", local, ana, bruno);
        Banda cuerdas = banda("Cuerdas Sueltas", "Folk acústico", "#9C27B0", local, bruno, carla);

        // Items: de usuarios y de bandas
        Item amplificador = itemDeUsuario(ana, "Amplificador Marshall 100W", 1, local);
        itemDeUsuario(ana, "Pedal de distorsión", 2, local);
        itemDeUsuario(bruno, "Batería Pearl (set completo)", 1, local);
        itemDeUsuario(carla, "Bajo Fender Precision", 1, local);
        itemRepository.save(new Item(reverb, "Micrófono Shure SM58", 3, local));
        itemRepository.save(new Item(cuerdas, "Teclado Yamaha", 1, local));

        // 1 reserva (ensayo de Los Reverb mañana por la tarde)
        LocalDateTime inicio = LocalDate.now().plusDays(1).atTime(18, 0);
        Reserva reserva = new Reserva();
        reserva.setUsuario(bruno);
        reserva.setLocal(local);
        reserva.setBanda(reverb);
        reserva.setTipoEvento(TipoEvento.ENSAYO);
        reserva.setFechaInicio(inicio);
        reserva.setFechaFin(inicio.plusHours(2));
        reserva.setEsReservaDiaCompleto(false);
        reserva.setEstado(ReservaEstado.CONFIRMADA);
        reserva.setColor(reverb.getColor());
        reserva.setNotas("Ensayo general antes del concierto");
        reservaRepository.save(reserva);

        // 1 préstamo activo (Ana presta el amplificador a Carla durante una semana)
        Prestamo prestamo = new Prestamo(amplificador, ana, LocalDateTime.now().plusDays(7));
        prestamo.setPrestadoAUsuario(carla);
        prestamo.setEstado(EstadoPrestamo.ACTIVO);
        prestamo.setNotas("Para el concierto del sábado");
        prestamoRepository.save(prestamo);
    }

    /**
     * Se crea con los setters (como hace la API al deserializar el JSON) y no con el
     * constructor Item(Usuario, ...): solo setPropietarioUsuario mantiene sincronizado el
     * campo deprecated "usuario", que es el que usa ItemRepository.findByUsuarioId, es decir,
     * la página "Mi Equipamiento" del frontend.
     */
    private Item itemDeUsuario(Usuario propietario, String descripcion, int cantidad, Local local) {
        Item item = new Item();
        item.setPropietarioUsuario(propietario);
        item.setDescripcion(descripcion);
        item.setCantidad(cantidad);
        item.setLocalOriginal(local);
        item.setLocalActual(local);
        return itemRepository.save(item);
    }

    private Banda banda(String nombre, String descripcion, String color, Local local, Usuario... miembros) {
        Banda banda = new Banda(nombre, descripcion, local);
        banda.setColor(color);
        Set<Usuario> set = new HashSet<>(Set.of(miembros));
        banda.setMiembros(set);
        return bandaRepository.save(banda);
    }
}
