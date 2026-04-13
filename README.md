# Local407 🎸

REST API + frontend for managing rehearsal space scheduling between multiple bands.

## The Problem

4 bands sharing 1 rehearsal space = constant scheduling conflicts, double bookings, and frustrated musicians. Built this to solve it.

## Tech Stack

- **Java 25** + **Spring Boot 4**
- **Spring Security** — JWT authentication
- **Spring Data JPA** + **Hibernate**
- **Spring Mail** — HTML email notifications
- **MySQL 9.5** (H2 for testing)
- **React 19** + **Vite** + **Tailwind CSS**
- **Gradle** + **Docker Compose**
- **JUnit 5** + **Mockito** — 101 automated tests
- **GitHub Actions** — CI/CD pipeline

## Features

- 🔐 **Authentication** — JWT tokens with BCrypt password encryption
- 📅 **Smart booking** — Reservation system with approval workflows and calendar view
- 🎸 **Band management** — Create bands, manage members, invite users
- 🎹 **Equipment loans** — Lend gear between users and bands, with overdue detection
- 🔔 **Notifications** — In-app + email alerts for bookings, loans, invitations, and reminders
- ✅ **Fully tested** — 101 tests across services, controllers, and security

## Architecture

```
src/main/java/com/example/demo/
├── controller/      # 11 REST controllers
├── service/         # Business logic
├── model/           # 10 JPA entities + 6 enums
├── repository/      # Data access with custom queries
├── security/        # JWT filter, auth components
├── dto/             # Request/Response objects
├── exception/       # Custom exceptions + global handler
└── scheduler/       # Scheduled tasks (overdue detection)

frontend/src/
├── pages/           # Dashboard, Calendar, Loans, Items, Profile...
├── components/      # Layout (Sidebar, TopBar, BottomNav) + UI system
├── services/        # API client layer
├── contexts/        # Auth context
└── utils/           # Helpers
```

## Quick Start

### Prerequisites
- Java 25+
- MySQL 9.5+ (or use Docker)
- Node.js 18+

### Setup

1. **Clone the repo**
```bash
git clone https://github.com/catikate/Local407.git
cd Local407
```

2. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your credentials:
# DB_USERNAME, DB_PASSWORD, JWT_SECRET, MAIL_USERNAME, MAIL_PASSWORD
```

> ⚠️ Never commit credentials. The `.env` file is gitignored.

3. **Start the backend**
```bash
docker compose up -d   # Start MySQL
./gradlew bootRun      # Start Spring Boot on :8080
```

4. **Start the frontend**
```bash
cd frontend
npm install
npm run dev            # Start Vite on :5173
```

5. **Run tests**
```bash
./gradlew test
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
./gradlew test                       # Run all 101 tests
./gradlew test --tests JwtUtilTest   # Run specific test class
```

Tests cover:
- **Services** (67 tests) — Business logic with mocked repositories
- **Controllers** (27 tests) — Integration tests for auth and reservations
- **Security** (7 tests) — JWT token generation and validation

## What I Learned

- Designing a relational schema with complex relationships (Users ↔ Bands ↔ Bookings ↔ Loans)
- Implementing JWT authentication from scratch (not just copy-paste)
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

Built by [Catalina Viscoitaliano](https://github.com/catikate) — Backend developer based in Barcelona.
