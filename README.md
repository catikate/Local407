# Local407 - Sistema de Gestión de Locales e Items

![CI/CD](https://github.com/catikate/Local407/actions/workflows/ci.yml/badge.svg)
![Release](https://github.com/catikate/Local407/actions/workflows/release.yml/badge.svg)
![Tests](https://img.shields.io/badge/tests-77%20passing-brightgreen)
![Java](https://img.shields.io/badge/Java-25-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.0-green)

API REST para gestión de locales, usuarios, items e invitaciones con autenticación JWT.

## Stack Tecnológico

**Backend:** Java 25 · Spring Boot 4.0.0 · Spring Data JPA · Spring Security  
**Database:** MySQL 9.5 · Hibernate ORM · H2 (testing)  
**Build:** Gradle · Docker Compose  
**Testing:** JUnit 5 · Mockito · AssertJ (15 tests, 100% passing)

## Características Principales

- **Autenticación JWT** - Tokens de 10 horas, login/register
- **CRUD Completo** - 5 entidades con repositorios personalizados
- **Relaciones JPA** - Many-to-Many, One-to-Many bidireccionales
- **Sistema de Préstamos** - Items prestables entre usuarios
- **Invitaciones** - Estados: PENDIENTE, ACEPTADA, RECHAZADA
- **Security Layer** - Filtros JWT, endpoints públicos/protegidos

## Arquitectura

```
src/main/java/com/example/demo/
├── model/              # 5 entidades JPA
├── repository/         # Repositorios con queries personalizadas
├── service/            # Capa de negocio
├── controller/         # 6 REST controllers
├── security/           # JWT + Spring Security
└── dto/                # DTOs de autenticación

src/test/java/
├── security/           # Tests JWT
└── service/            # Tests unitarios con Mockito
```

## Modelo de Datos

**Usuario** → nombre, apellido, email (unique), contraseña  
**Local** → nombre, admin (Usuario)  
**Item** → descripción, cantidad, propietario (Usuario), local, prestadoA (Usuario)  
**Invitacion** → de (Usuario), a (Usuario), local, estado (ENUM)  
**UsuarioLocal** → relación Many-to-Many (Usuario ↔ Local)

## Quick Start

```bash
# 1. Iniciar MySQL
docker-compose up -d

# 2. Configurar application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/mydatabase
spring.datasource.username=myuser
spring.datasource.password=secret
jwt.secret=YOUR_SECRET_KEY

# 3. Ejecutar aplicación
./gradlew bootRun

# 4. Ejecutar tests
./gradlew test
```

**API URL:** `http://localhost:8080`

## API Endpoints

### Públicos (No requieren auth)
```
POST /api/auth/login        # Iniciar sesión
POST /api/auth/register     # Registrar usuario
```

### Protegidos (Requieren `Authorization: Bearer {token}`)
```
# Usuarios
GET    /api/usuarios
GET    /api/usuarios/{id}
GET    /api/usuarios/email/{email}
POST   /api/usuarios
PUT    /api/usuarios/{id}
DELETE /api/usuarios/{id}

# Locales  
GET    /api/locales
GET    /api/locales/admin/{adminId}
POST   /api/locales
PUT    /api/locales/{id}
DELETE /api/locales/{id}

# Items
GET    /api/items
GET    /api/items/usuario/{usuarioId}
GET    /api/items/prestado/{prestadoAId}
POST   /api/items
PUT    /api/items/{id}        # Incluye préstamos
DELETE /api/items/{id}

# Invitaciones
GET    /api/invitaciones/enviadas/{deId}
GET    /api/invitaciones/recibidas/{aId}
GET    /api/invitaciones/estado/{estado}
POST   /api/invitaciones
PUT    /api/invitaciones/{id}
DELETE /api/invitaciones/{id}

# Usuario-Local
GET    /api/usuario-locales/usuario/{usuarioId}
POST   /api/usuario-locales
DELETE /api/usuario-locales/usuario/{uid}/local/{lid}
```

## Ejemplo de Uso

```bash
# 1. Registrarse
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Juan","apellido":"Pérez","email":"juan@example.com","contrasenia":"pass123"}'

# Respuesta: {"token":"eyJhbG...","email":"juan@example.com","nombre":"Juan","id":1}

# 2. Crear local (con token)
curl -X POST http://localhost:8080/api/locales \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{"nombre":"Estudio Central","admin":{"id":1}}'

# 3. Crear y prestar item
curl -X POST http://localhost:8080/api/items \
  -H "Authorization: Bearer {token}" \
  -d '{"descripcion":"Guitarra Fender","cantidad":1,"usuario":{"id":1},"local":{"id":1},"prestadoA":{"id":2}}'
```

## Testing

**Cobertura:** 77 tests (100% passing)

### Tests Unitarios
- **Controllers** (23 tests) - AuthController, ReservaController
- **Services** (47 tests) - Usuario, Reserva, Local, Invitacion, Item, UsuarioLocal
- **Security** (7 tests) - JwtUtil

```bash
./gradlew test                       # Ejecutar todos los tests
./gradlew test --tests JwtUtilTest   # Test específico
xdg-open build/reports/tests/test/index.html  # Ver reporte
```

### CI/CD Automático
Los tests se ejecutan automáticamente en cada push/PR via GitHub Actions:
- ✅ Build y compilación
- ✅ Ejecución de 77 tests con MySQL
- ✅ Generación de reportes
- ✅ Construcción de imagen Docker
- 📦 Release automático con tags (v1.0.0)

## Seguridad

- **JWT:** Tokens de 10h con HS512
- **CSRF:** Deshabilitado (API stateless)
- **CORS:** Sin configurar (agregar según necesidad)
- ⚠️ **Producción:** Hashear passwords (BCrypt), cambiar secret, HTTPS, rate limiting

## CI/CD Pipeline

### GitHub Actions Workflows

**CI Pipeline** (push/PR a main/develop):
- Build automático con Gradle
- 77 tests unitarios con MySQL
- Validación de calidad de código
- Construcción de imagen Docker
- Artifacts: JAR + reportes de tests

**Release Pipeline** (tags v*.*.*)
- Creación de release en GitHub
- Publicación de JAR
- Build y push de imagen Docker a Docker Hub

### Docker

```bash
# Build local
docker build -t local407:latest .

# Run con MySQL
docker compose up -d
docker run -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:mysql://host.docker.internal:3306/mydatabase \
  -e SPRING_DATASOURCE_USERNAME=myuser \
  -e SPRING_DATASOURCE_PASSWORD=secret \
  local407:latest
```

Ver más detalles en [.github/workflows/README.md](.github/workflows/README.md)

## Repositorio

**GitHub:** https://github.com/catikate/Local407

---

# 📝 Mis Anotaciones Personales

## Tests Postman

**TEST 1 - Login exitoso**
```
POST http://localhost:8080/api/auth/login
Body: {"email":"juan@example.com","contrasenia":"password123"}
✓ Status 200, token recibido
```

**TEST 2 - Endpoint sin token**
```
GET http://localhost:8080/api/usuarios
✓ Status 403 Forbidden
```

**TEST 3 - Endpoint con token**
```
GET http://localhost:8080/api/usuarios
Headers: Authorization: Bearer {TOKEN}
✓ Status 200, lista de usuarios
```

**TEST 4 - Crear local**
```
POST http://localhost:8080/api/locales
Headers: Authorization: Bearer {TOKEN}
Body: {"nombre":"Local Test","admin":{"id":2}}
✓ Status 201
```

**TEST 5 - Register**
```
POST http://localhost:8080/api/auth/register
Body: {"nombre":"Test","apellido":"User","email":"test@example.com","contrasenia":"test123"}
✓ Status 201, token recibido
```

## Checklist Features

✅ Usuarios (CRUD)  
✅ Locales (CRUD)  
✅ UsuarioLocal (Many-to-Many)  
✅ Items (CRUD + préstamos)  
✅ Invitaciones (CRUD + estados)  
✅ Autenticación JWT  
✅ Tests unitarios

## Repositories Personalizados

- **UsuarioRepository** - `findByEmail()`
- **LocalRepository** - `findByAdminId()`  
- **UsuarioLocalRepository** - `findByUsuarioId()`, `findByLocalId()`
- **ItemRepository** - `findByUsuarioId()`, `findByLocalId()`, `findByPrestadoAId()`
- **InvitacionRepository** - `findByDeId()`, `findByAId()`, `findByLocalId()`, `findByEstado()`
