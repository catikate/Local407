# Local407

REST API and frontend for managing rehearsal space scheduling between multiple bands.

**[github.com/catikate/Local407](https://github.com/catikate/Local407)**

---

## The problem

4 bands sharing 1 rehearsal space. Constant scheduling conflicts, double bookings, frustrated musicians. Built this to solve it.

---

## Stack

| Layer | Technology |
|---|---|
| Backend | Java 25 + Spring Boot 4 |
| Auth | Spring Security — JWT + BCrypt |
| Persistence | Spring Data JPA + Hibernate + MySQL 9.5 |
| Notifications | Spring Mail — HTML email templates |
| Frontend | React 19 + Vite + Tailwind CSS |
| Testing | JUnit 5 + Mockito — 101 automated tests |
| CI/CD | GitHub Actions + Docker Compose |

---

## Architecture decisions

**Layered architecture with clear separation.** Controllers handle HTTP, services own the business logic, repositories manage data access. This made the codebase easy to test — services are tested in isolation with mocked repositories.

**JWT authentication implemented from scratch.** Rather than relying on a pre-built solution, I built the JWT filter, token generation, and validation layer manually. This forced a real understanding of how stateless authentication works.

**Approval workflow for bookings.** Reservations go through a state machine: pending → approved/rejected. This was a deliberate product decision to avoid conflicts when two bands try to book the same slot simultaneously.

**Scheduled tasks for overdue detection.** A Spring `@Scheduled` component runs periodically to detect overdue equipment loans and trigger notifications. No manual intervention required.

---

## Features

- JWT authentication with BCrypt password encryption
- Reservation system with approval workflows and calendar view
- Band management — create bands, manage members, invite users
- Equipment loans between users and bands, with overdue detection
- Notification system — in-app and email alerts

---

## Quick start

```bash
# Clone and configure
git clone https://github.com/catikate/Local407.git
cd Local407
cp .env.example .env   # fill in DB credentials, JWT secret, mail config

# Start backend
docker compose up -d   # MySQL
./gradlew bootRun      # Spring Boot on :8080

# Start frontend
cd frontend
npm install
npm run dev            # Vite on :5173

# Run tests
./gradlew test
Testing
101 automated tests across three layers:

Services (67) — business logic with mocked repositories
Controllers (27) — integration tests for auth and reservations
Security (7) — JWT token generation and validation

./gradlew test                       # all tests
./gradlew test --tests JwtUtilTest   # specific class
API — main endpoints
Resource	Method	Endpoint
Auth	POST	/api/auth/register /api/auth/login
Bands	GET POST	/api/bandas
Reservations	GET POST PUT DELETE	/api/reservas
Loans	GET POST PUT	/api/prestamos
Notifications	GET PATCH	/api/notifications/usuario/{id}
Built by Catalina Viscoitaliano — Backend developer based in Barcelona.



