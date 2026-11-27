# Local407 🎸

[![CI/CD Pipeline](https://github.com/catikate/Local407/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/catikate/Local407/actions/workflows/ci.yml)

REST API + frontend for managing rehearsal space scheduling between multiple bands.

## The problem

4 bands sharing 1 rehearsal space. Constant scheduling conflicts, double bookings, frustrated musicians. Built this to solve it.

## Stack

| Layer | Technology |
|---|---|
| Backend | Java 25 + Spring Boot 4 |
| Auth | Spring Security — JWT |
| Persistence | Spring Data JPA + Hibernate + MySQL 9.5 |
| Notifications | Spring Mail — HTML email templates |
| Frontend | React 19 + Vite + Tailwind CSS |
| Testing | JUnit 5 + Mockito (107 backend tests), Vitest + Testing Library (32 frontend tests) |
| CI/CD | GitHub Actions + Docker Compose |

## Architecture decisions

**Layered architecture with clear separation.** Controllers handle HTTP, services own the business logic, repositories manage data access. This made the codebase easy to test — services are tested in isolation with mocked repositories.

**Custom JWT authentication.** I wrote the JWT filter and token handling myself, using the `jjwt` library to sign and read tokens. This forced a real understanding of how stateless authentication works.

**Approval workflow for full-day rehearsals.** Full-day rehearsals go through a state machine: pending → approved/rejected. All other bookings are confirmed automatically. Every new booking is first checked for time conflicts.

**Scheduled tasks for overdue detection.** A Spring `@Scheduled` component runs periodically to detect overdue equipment loans and trigger notifications. No manual intervention required.

## Features

- 🔐 **Authentication** — JWT tokens
- 📅 **Smart booking** — Reservation system with approval workflows and calendar view
- 🎸 **Band management** — Create bands, manage members, invite users
- 🎹 **Equipment loans** — Lend gear between users and bands, with overdue detection
- 🔔 **Notifications** — In-app + email alerts for bookings, loans, invitations, and reminders
- ✅ **Tested** — 107 backend tests (services, controllers, security, demo data) and 32 frontend tests

## Run it in one command

You only need [Docker](https://docs.docker.com/get-docker/) with Compose v2:

```bash
git clone https://github.com/catikate/Local407.git
cd Local407
docker compose up --build
```

The first build takes a few minutes. When everything is healthy:

| Service | URL |
|---------|-----|
| App (React + nginx) | http://localhost:3000 |
| API (Spring Boot) | http://localhost:8080/api |
| phpMyAdmin | http://localhost:8081 |

Log in with one of the [demo users](#demo-data) below. Stop with `docker compose down`; add `-v` to also delete the database and start from fresh demo data.

The values in `compose.yaml` are demo-only defaults, so no `.env` is needed. To use your own database password, JWT secret or SMTP account, copy `.env.example` to `.env` and edit it.

## Demo data

With the `demo` Spring profile the backend creates sample data on startup. It is idempotent: if the demo users already exist, nothing is created again. `docker compose up` activates this profile by default. When running with `./gradlew bootRun`, use `SPRING_PROFILES_ACTIVE=demo`.

| User | Email | Password | Role in the demo |
|------|-------|----------|------------------|
| Ana García | `ana@local407.demo` | `demo1234` | Admin of the local, lends an amplifier |
| Bruno Martínez | `bruno@local407.demo` | `demo1234` | Member of both bands, owns tomorrow's rehearsal |
| Carla López | `carla@local407.demo` | `demo1234` | Member of Cuerdas Sueltas, borrows the amplifier |

It also creates 1 local (**Local 407**), 2 bands (**Los Reverb**, **Cuerdas Sueltas**), 6 items, 1 confirmed rehearsal (tomorrow, 18:00-20:00) and 1 active loan.

> ⚠️ These credentials are public and for local demos only. To start with an empty database, set `SPRING_PROFILES_ACTIVE=` (empty) in `.env`, or do not use the `demo` profile.

## Screenshots

<!-- Replace each placeholder with the real image: save it in docs/screenshots/ and use
     ![Dashboard](docs/screenshots/dashboard.png) -->

| Screen | File |
|--------|------|
| Dashboard | _pending_ `docs/screenshots/dashboard.png` |
| Calendar and reservations | _pending_ `docs/screenshots/calendario.png` |
| Equipment (items) | _pending_ `docs/screenshots/items.png` |
| Loans | _pending_ `docs/screenshots/prestamos.png` |
| Mobile view | _pending_ `docs/screenshots/mobile.png` |

## Architecture

```
src/main/java/com/example/demo/
├── controller/      # 11 REST controllers
├── service/         # Business logic
├── model/           # 10 JPA entities + 6 enums
├── repository/      # Data access with custom queries
├── security/        # JWT filter, auth components
├── config/          # Demo data seeder (profile "demo")
├── dto/             # Request/Response objects
├── exception/       # Custom exceptions
└── scheduler/       # Scheduled tasks (overdue detection)

frontend/src/
├── pages/           # Dashboard, Calendar, Loans, Items, Profile...
├── components/      # Layout (Sidebar, TopBar, BottomNav) + UI system
├── services/        # API client layer
├── context/         # Auth context
├── hooks/           # useAuth, useUnreadNotifications
└── utils/           # Helpers
```

## Development setup

Run the pieces yourself instead of the full compose stack.

### Prerequisites
- Java 25 (Gradle can provision it)
- Node.js 20.19+ (CI uses 22)
- Docker (for MySQL), or your own MySQL 9.5

### Setup

1. **Configure environment**
```bash
cp .env.example .env
# Edit .env: DB_URL, DB_USERNAME, DB_PASSWORD, JWT_SECRET, MAIL_USERNAME, MAIL_PASSWORD
```

> ⚠️ Never commit credentials. The `.env` file is gitignored.

2. **Start the database and the backend**
```bash
docker compose up -d mysql                    # only MySQL
SPRING_PROFILES_ACTIVE=demo ./gradlew bootRun # Spring Boot on :8080, with demo data
```

3. **Start the frontend**
```bash
cd frontend
cp .env.example .env     # VITE_API_URL=http://localhost:8080/api (must end in /api)
npm install
npm run dev              # Vite on :5173
```

4. **Run tests**
```bash
./gradlew test                  # backend
cd frontend && npx vitest run   # frontend
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |

### Bands
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bandas` | List all bands |
| POST | `/api/bandas` | Create band |
| POST | `/api/bandas/{id}/miembros/{userId}` | Add member |
| POST | `/api/bandas/{id}/unirse/{userId}` | Join band |

### Reservations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reservas` | List reservations |
| POST | `/api/reservas` | Create reservation |
| GET | `/api/reservas/usuario/{id}/calendario` | Calendar view |
| PUT | `/api/reservas/aprobaciones/{id}` | Approve/reject |
| DELETE | `/api/reservas/{id}` | Cancel reservation |

### Loans
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/prestamos` | List loans |
| POST | `/api/prestamos` | Create loan |
| PUT | `/api/prestamos/{id}/devolver` | Return item |
| GET | `/api/prestamos/vencidos` | Overdue loans |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications/usuario/{id}` | User notifications |
| GET | `/api/notifications/usuario/{id}/unread/count` | Unread count |
| PATCH | `/api/notifications/usuario/{id}/read-all` | Mark all read |

> Full CRUD available for all resources. See [API docs](src/main/java/com/example/demo/controller/) for complete endpoint list.

## Testing

```bash
./gradlew test                       # Run all 107 backend tests
./gradlew test --tests JwtUtilTest   # Run specific test class
cd frontend && npx vitest run        # Run the 32 frontend tests
```

Backend tests cover:
- **Services** (66 tests) — Business logic with mocked repositories
- **Controllers** (27 tests) — Integration tests for auth and reservations
- **Security** (7 tests) — JWT token generation and validation
- **Demo data** (6 tests) — Seeder contents, idempotency and login with the demo users
- **Application startup** (1 test) — The Spring context loads

## What I Learned

- Designing a relational schema with complex relationships (Users ↔ Bands ↔ Bookings ↔ Loans)
- Implementing JWT authentication with my own Spring Security filter and the `jjwt` library
- Building a full notification system with email integration (Spring Mail + HTML templates)
- Writing meaningful tests that catch real bugs
- Setting up CI/CD that actually runs on every push

## Future Improvements

- [ ] WebSocket real-time notifications
- [ ] Recurring bookings
- [ ] User roles and permissions (admin, member, guest)
- [ ] Equipment maintenance tracking
- [ ] File uploads for band photos and equipment images

---

Built by Catalina Viscoitaliano — Software engineer based in Barcelona.
