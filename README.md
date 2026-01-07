# Local407 - Rehearsal Space & Equipment Management System

![CI/CD](https://github.com/catikate/Local407/actions/workflows/ci.yml/badge.svg)
![Release](https://github.com/catikate/Local407/actions/workflows/release.yml/badge.svg)
![Tests](https://img.shields.io/badge/tests-101%20passing-brightgreen)
![Java](https://img.shields.io/badge/Java-25-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.0-green)

REST API for managing rehearsal spaces, users, equipment, bands, reservations, loans, and notifications with JWT authentication.

## Tech Stack

**Frontend:** React 18 · Vite · React Router · Axios · Material-UI
**Backend:** Java 25 · Spring Boot 4.0.0 · Spring Data JPA · Spring Security · Spring Mail
**Database:** MySQL 9.5 · Hibernate ORM · H2 (testing)
**Build:** Gradle · Docker Compose
**Testing:** JUnit 5 · Mockito · AssertJ (101 tests, 100% passing)

## Key Features

- **JWT Authentication** - 10-hour tokens, login/register
- **Complete CRUD** - 10 entities with custom repositories
- **JPA Relationships** - Many-to-Many, One-to-Many bidirectional
- **Loan System** - Equipment lending between users and bands with status tracking
- **Reservation System** - Space booking with approval workflow and calendar integration
- **Band Management** - Create bands, manage members, join bands
- **Notification System** - Real-time notifications with email integration (Spring Mail)
- **Invitation System** - States: PENDING, ACCEPTED, REJECTED
- **Security Layer** - JWT filters, public/protected endpoints
- **Email Templates** - HTML email notifications for critical events

## Architecture

```
src/main/java/com/example/demo/
├── model/              # 10 JPA entities + 6 enums
├── repository/         # Repositories with custom queries
├── service/            # Business logic layer
├── controller/         # 11 REST controllers
├── security/           # JWT + Spring Security
└── dto/                # Authentication & response DTOs

src/test/java/
├── security/           # JWT tests
├── controller/         # Controller integration tests
└── service/            # Unit tests with Mockito
```

## Data Model

### Entities (10)

**Usuario** → name, lastname, email (unique), password
**Local** → name, admin (Usuario)
**Item** → description, quantity, owner (Usuario), local
**Banda** → name, local, members (Many-to-Many with Usuario)
**Prestamo** → item, loanedBy, loanedTo (Usuario/Banda), origin/destination locals, dates, status
**Reserva** → user/band, local, dates, event type, status, requires approval
**ReservaAprobacion** → reservation, approver, approved status
**Invitacion** → from (Usuario), to (Usuario), local, status
**UsuarioLocal** → Many-to-Many relationship (Usuario ↔ Local)
**Notificacion** → user, type, title, message, priority, read status, email sent flag

### Enums (6)

**EstadoPrestamo** → PENDIENTE, ACTIVO, VENCIDO, DEVUELTO
**InvitacionEstado** → PENDIENTE, ACEPTADA, RECHAZADA
**PrioridadNotificacion** → LOW, NORMAL, HIGH, URGENT
**ReservaEstado** → PENDIENTE, APROBADA, RECHAZADA, CANCELADA
**TipoEvento** → ENSAYO, CONCIERTO, GRABACION, OTRO
**TipoNotificacion** → BOOKING_CREATED, BOOKING_APPROVED, BOOKING_REJECTED, BOOKING_CANCELLED, ITEM_LOAN_REQUEST, ITEM_LOAN_APPROVED, ITEM_LOAN_REJECTED, ITEM_OVERDUE, RETURN_ITEM_REMINDER, MEMBER_ADDED, MEMBER_REMOVED, LOCAL_CHANGED, PAYMENT_REMINDER, REHEARSAL_REMINDER

## Quick Start

### Backend

```bash
# 1. Start MySQL
docker-compose up -d

# 2. Create .env file from example
cp .env.example .env
# Then edit .env with your actual credentials

# Or configure environment variables directly:
# MYSQL_USER, MYSQL_PASSWORD, JWT_SECRET, MAIL_USERNAME, MAIL_PASSWORD

# 3. Run application
./gradlew bootRun

# 4. Run tests
./gradlew test
```

**Backend API:** `http://localhost:8080`

### Frontend

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Configure .env
VITE_API_URL=http://localhost:8080

# 4. Run application
npm run dev
```

**Frontend URL:** `http://localhost:5173`

See more details in [frontend/README.md](frontend/README.md)

## API Endpoints

### Public (No authentication required)
```
POST /api/auth/login        # Login
POST /api/auth/register     # Register new user
```

### Protected (Require `Authorization: Bearer {token}`)

#### Users
```
GET    /api/usuarios
GET    /api/usuarios/{id}
GET    /api/usuarios/email/{email}
POST   /api/usuarios
PUT    /api/usuarios/{id}
DELETE /api/usuarios/{id}
```

#### Locals (Rehearsal Spaces)
```
GET    /api/locales
GET    /api/locales/{id}
GET    /api/locales/admin/{adminId}
POST   /api/locales
PUT    /api/locales/{id}
DELETE /api/locales/{id}
```

#### Items (Equipment)
```
GET    /api/items
GET    /api/items/{id}
GET    /api/items/usuario/{usuarioId}
GET    /api/items/prestado/{prestadoAId}
POST   /api/items
PUT    /api/items/{id}
DELETE /api/items/{id}
```

#### Bands
```
GET    /api/bandas
GET    /api/bandas/{id}
GET    /api/bandas/local/{localId}
GET    /api/bandas/search?nombre={name}
POST   /api/bandas
PUT    /api/bandas/{id}
DELETE /api/bandas/{id}
POST   /api/bandas/{bandaId}/miembros/{usuarioId}      # Add member
DELETE /api/bandas/{bandaId}/miembros/{usuarioId}      # Remove member
POST   /api/bandas/{bandaId}/unirse/{usuarioId}        # Join band
```

#### Loans (Préstamos)
```
GET    /api/prestamos
GET    /api/prestamos/{id}
GET    /api/prestamos/item/{itemId}
GET    /api/prestamos/prestado-por/{usuarioId}
GET    /api/prestamos/prestado-a-usuario/{usuarioId}
GET    /api/prestamos/prestado-a-banda/{bandaId}
GET    /api/prestamos/estado/{estado}
GET    /api/prestamos/vencidos                         # Overdue loans
POST   /api/prestamos
PUT    /api/prestamos/{id}
PUT    /api/prestamos/{id}/devolver                    # Return item
PUT    /api/prestamos/actualizar-vencidos              # Update overdue status
DELETE /api/prestamos/{id}
```

#### Reservations (Reservas)
```
GET    /api/reservas
GET    /api/reservas/{id}
GET    /api/reservas/usuario/{usuarioId}
GET    /api/reservas/usuario/{usuarioId}/compartidas   # Shared reservations
GET    /api/reservas/local/{localId}
GET    /api/reservas/estado/{estado}
GET    /api/reservas/usuario/{usuarioId}/calendario?year={year}&month={month}
GET    /api/reservas/{id}/aprobaciones
GET    /api/reservas/aprobaciones/pendientes/usuario/{usuarioId}
POST   /api/reservas
PUT    /api/reservas/{id}
PUT    /api/reservas/aprobaciones/{aprobacionId}       # Respond to approval
DELETE /api/reservas/{id}
```

#### Invitations
```
GET    /api/invitaciones/enviadas/{deId}
GET    /api/invitaciones/recibidas/{aId}
GET    /api/invitaciones/estado/{estado}
POST   /api/invitaciones
PUT    /api/invitaciones/{id}
DELETE /api/invitaciones/{id}
```

#### Notifications
```
GET    /api/notifications/usuario/{usuarioId}
GET    /api/notifications/usuario/{usuarioId}/unread
GET    /api/notifications/usuario/{usuarioId}/unread/count
PATCH  /api/notifications/{id}/read?usuarioId={usuarioId}
PATCH  /api/notifications/usuario/{usuarioId}/read-all
DELETE /api/notifications/{id}?usuarioId={usuarioId}
```

#### User-Local Relationships
```
GET    /api/usuario-locales/usuario/{usuarioId}
POST   /api/usuario-locales
DELETE /api/usuario-locales/usuario/{uid}/local/{lid}
```

## Usage Examples

```bash
# 1. Register
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Juan","apellido":"Pérez","email":"juan@example.com","contrasenia":"pass123"}'

# Response: {"token":"eyJhbG...","email":"juan@example.com","nombre":"Juan","id":1}

# 2. Create a band
curl -X POST http://localhost:8080/api/bandas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{"nombre":"The Rockers","local":{"id":1}}'

# 3. Create reservation
curl -X POST http://localhost:8080/api/reservas \
  -H "Authorization: Bearer {token}" \
  -d '{"usuario":{"id":1},"local":{"id":1},"fechaInicio":"2026-01-10T18:00:00","fechaFin":"2026-01-10T21:00:00","tipoEvento":"ENSAYO"}'

# 4. Loan equipment
curl -X POST http://localhost:8080/api/prestamos \
  -H "Authorization: Bearer {token}" \
  -d '{"item":{"id":1},"prestadoPor":{"id":1},"prestadoAUsuario":{"id":2},"localOrigen":{"id":1},"fechaDevolucionEsperada":"2026-01-15T18:00:00"}'
```

## Testing

**Coverage:** 101 tests (100% passing)

### Test Breakdown
- **Controllers** (27 tests) - AuthController, ReservaController
- **Services** (67 tests) - Usuario, Reserva, Local, Invitacion, Item, UsuarioLocal, Banda, Prestamo, Notificacion
- **Security** (7 tests) - JwtUtil

```bash
./gradlew test                       # Run all tests
./gradlew test --tests JwtUtilTest   # Specific test
xdg-open build/reports/tests/test/index.html  # View report
```

### CI/CD Automation
Tests run automatically on every push/PR via GitHub Actions:
- ✅ Build and compilation
- ✅ 101 tests with MySQL
- ✅ Report generation
- ✅ Docker image build
- 📦 Automatic release with tags (v1.0.0)

## Security

- **JWT:** 10-hour tokens with HS512
- **CSRF:** Disabled (stateless API)
- **CORS:** Configured for localhost:5173 and localhost:3000
- **Passwords:** Hashed with BCrypt
- ⚠️ **Production:** Change secret key, enable HTTPS, implement rate limiting

## Notification System

The system includes a comprehensive notification system with the following features:

### Automatic Notifications
- **Reservation Events:** Creation, approval, rejection, cancellation
- **Loan Events:** Request, approval, rejection, overdue items, return reminders
- **Band Events:** Member added/removed
- **Space Changes:** Local/space modifications

### Email Integration
- HTML email templates for critical events
- Configurable SMTP via Spring Mail
- Automatic email sending for URGENT priority notifications
- Email sent status tracking

### Priority Levels
- **LOW:** Informational only
- **NORMAL:** Standard notifications (default)
- **HIGH:** Important events
- **URGENT:** Critical events (auto-send email)

## CI/CD Pipeline

### GitHub Actions Workflows

**CI Pipeline** (push/PR to main/develop):
- Automatic build with Gradle
- 101 unit tests with MySQL
- Code quality validation
- Docker image build
- Artifacts: JAR + test reports

**Release Pipeline** (tags v*.*.*)
- GitHub release creation
- JAR publication
- Docker image build and push to Docker Hub

### Docker

```bash
# Local build
docker build -t local407:latest .

# Run with MySQL (requires .env file with credentials)
docker compose up -d

# Or run container manually with environment variables
docker run -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:mysql://host.docker.internal:3306/mydatabase \
  -e SPRING_DATASOURCE_USERNAME=${MYSQL_USER} \
  -e SPRING_DATASOURCE_PASSWORD=${MYSQL_PASSWORD} \
  -e JWT_SECRET=${JWT_SECRET} \
  local407:latest
```

See more details in [.github/workflows/README.md](.github/workflows/README.md)

## Repository

**GitHub:** https://github.com/catikate/Local407

---

## Development Notes

### Custom Repository Queries

- **UsuarioRepository** - `findByEmail()`
- **LocalRepository** - `findByAdminId()`
- **UsuarioLocalRepository** - `findByUsuarioId()`, `findByLocalId()`
- **ItemRepository** - `findByUsuarioId()`, `findByLocalId()`, `findByPrestadoAId()`
- **InvitacionRepository** - `findByDeId()`, `findByAId()`, `findByLocalId()`, `findByEstado()`
- **BandaRepository** - `findByLocalId()`, `findByNombre()`
- **PrestamoRepository** - `findByItemId()`, `findByPrestadoPorId()`, `findByPrestadoAUsuarioId()`, `findByPrestadoABandaId()`, `findByEstado()`, `findVencidos()`
- **ReservaRepository** - `findByUsuarioId()`, `findByBandaId()`, `findByLocalId()`, `findByEstado()`, `findByUsuarioAndMonth()`
- **NotificacionRepository** - `findByUsuarioIdAndIsReadOrderByCreatedAtDesc()`, `countByUsuarioIdAndIsRead()`

### Implemented Features Checklist

✅ Users (CRUD)
✅ Locals/Spaces (CRUD)
✅ UsuarioLocal (Many-to-Many)
✅ Items/Equipment (CRUD)
✅ Bands (CRUD + member management)
✅ Loans (CRUD + status tracking + overdue detection)
✅ Reservations (CRUD + approval workflow + calendar)
✅ Invitations (CRUD + states)
✅ Notifications (CRUD + email integration)
✅ JWT Authentication
✅ Unit & Integration Tests
✅ CI/CD Pipeline
✅ Docker Support