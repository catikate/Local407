package com.example.demo.config;

import com.example.demo.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** Sin el perfil "demo" no se crea ningún dato. */
// application.properties fija el dialecto de MySQL, que pisa el de application-test.properties:
// hay que forzar H2 aquí para que se cree el esquema. BD en memoria propia para no
// compartir datos con otros contextos de test.
@SpringBootTest(properties = {
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
        "spring.datasource.url=jdbc:h2:mem:no-demo-seed;DB_CLOSE_DELAY=-1"
})
@ActiveProfiles("test")
class DemoDataSeederProfileTest {

    @MockitoBean
    private JavaMailSender mailSender;

    @Autowired private ApplicationContext context;
    @Autowired private UsuarioRepository usuarioRepository;

    @Test
    void seederIsNotActiveWithoutTheDemoProfile() {
        assertTrue(context.getBeansOfType(DemoDataSeeder.class).isEmpty());
        assertEquals(0, usuarioRepository.count());
    }
}
