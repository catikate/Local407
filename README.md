# Local407 - Sistema de Gestión de Locales e Items

API REST desarrollada con Spring Boot para la gestión de locales, usuarios, items e invitaciones con autenticación JWT.

## Características

- ✅ Autenticación JWT (JSON Web Tokens)
- ✅ CRUD completo para Usuarios, Locales, Items e Invitaciones
- ✅ Gestión de relaciones Many-to-Many entre Usuarios y Locales
- ✅ Sistema de préstamos de items entre usuarios
- ✅ Sistema de invitaciones con estados (PENDIENTE, ACEPTADA, RECHAZADA)
- ✅ Spring Security con endpoints públicos y protegidos
- ✅ Base de datos MySQL con Docker Compose
- ✅ Hibernate/JPA para persistencia

## Tecnologías

- **Java 25**
- **Spring Boot 4.0.0**
- **Spring Data JPA**
- **Spring Security**
- **JWT (io.jsonwebtoken:jjwt 0.12.5)**
- **MySQL 9.5**
- **Docker Compose**
- **Gradle**

## Estructura del Proyecto

```
src/main/java/com/example/demo/
├── model/              # Entidades JPA
│   ├── Usuario.java
│   ├── Local.java
│   ├── Item.java
│   ├── Invitacion.java
│   ├── UsuarioLocal.java
│   └── UsuarioLocalId.java
├── repository/         # Repositorios Spring Data
│   ├── UsuarioRepository.java
│   ├── LocalRepository.java
│   ├── ItemRepository.java
│   ├── InvitacionRepository.java
│   └── UsuarioLocalRepository.java
├── service/           # Servicios de negocio
│   ├── UsuarioService.java
│   ├── LocalService.java
│   ├── ItemService.java
│   ├── InvitacionService.java
│   └── UsuarioLocalService.java
├── controller/        # Controladores REST
│   ├── AuthController.java
│   ├── UsuarioController.java
│   ├── LocalController.java
│   ├── ItemController.java
│   ├── InvitacionController.java
│   └── UsuarioLocalController.java
├── security/          # Configuración de seguridad
│   ├── SecurityConfig.java
│   ├── JwtUtil.java
│   └── JwtAuthenticationFilter.java
└── dto/              # DTOs
    ├── LoginRequest.java
    └── AuthResponse.java
```

## Modelo de Datos

### Usuario
- `id` (Long, PK)
- `nombre` (String)
- `apellido` (String)
- `email` (String, unique)
- `contrasenia` (String)

### Local
- `id` (Long, PK)
- `nombre` (String)
- `admin` (Usuario, FK)

### UsuarioLocal (Many-to-Many)
- `usuario` (Usuario, FK)
- `local` (Local, FK)

### Item
- `id` (Long, PK)
- `descripcion` (String)
- `cantidad` (Integer)
- `usuario` (Usuario, FK - propietario)
- `local` (Local, FK)
- `prestadoA` (Usuario, FK - nullable)

### Invitacion
- `id` (Long, PK)
- `de` (Usuario, FK - quien invita)
- `a` (Usuario, FK - invitado)
- `local` (Local, FK)
- `estado` (Enum: PENDIENTE, ACEPTADA, RECHAZADA)

## Instalación y Configuración

### Prerrequisitos
- Java 25
- Docker y Docker Compose
- Gradle

### Configuración de Base de Datos

1. Inicia MySQL con Docker Compose:
```bash
docker-compose up -d
```

2. Configura las credenciales en `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/mydatabase
spring.datasource.username=myuser
spring.datasource.password=secret
jwt.secret=5367566B59703373367639792F423F4528482B4D6251655468576D5A71347437
```

### Ejecutar la Aplicación

```bash
./gradlew bootRun
```

La aplicación estará disponible en `http://localhost:8080`

## API Endpoints

### Endpoints Públicos (No requieren autenticación)

#### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar nuevo usuario
- `GET /` - Página principal

### Endpoints Protegidos (Requieren token JWT)

Todos los demás endpoints requieren el header: `Authorization: Bearer {token}`

#### Usuarios (`/api/usuarios`)
- `GET /api/usuarios` - Listar todos
- `GET /api/usuarios/{id}` - Obtener por ID
- `GET /api/usuarios/email/{email}` - Obtener por email
- `POST /api/usuarios` - Crear usuario
- `PUT /api/usuarios/{id}` - Actualizar usuario
- `DELETE /api/usuarios/{id}` - Eliminar usuario

#### Locales (`/api/locales`)
- `GET /api/locales` - Listar todos
- `GET /api/locales/{id}` - Obtener por ID
- `GET /api/locales/admin/{adminId}` - Obtener por administrador
- `POST /api/locales` - Crear local
- `PUT /api/locales/{id}` - Actualizar local
- `DELETE /api/locales/{id}` - Eliminar local

#### Items (`/api/items`)
- `GET /api/items` - Listar todos
- `GET /api/items/{id}` - Obtener por ID
- `GET /api/items/usuario/{usuarioId}` - Obtener por propietario
- `GET /api/items/local/{localId}` - Obtener por local
- `GET /api/items/prestado/{prestadoAId}` - Obtener items prestados
- `POST /api/items` - Crear item
- `PUT /api/items/{id}` - Actualizar item (incluye préstamos)
- `DELETE /api/items/{id}` - Eliminar item

#### Invitaciones (`/api/invitaciones`)
- `GET /api/invitaciones` - Listar todas
- `GET /api/invitaciones/{id}` - Obtener por ID
- `GET /api/invitaciones/enviadas/{deId}` - Obtener enviadas por usuario
- `GET /api/invitaciones/recibidas/{aId}` - Obtener recibidas por usuario
- `GET /api/invitaciones/local/{localId}` - Obtener por local
- `GET /api/invitaciones/estado/{estado}` - Obtener por estado
- `POST /api/invitaciones` - Crear invitación
- `PUT /api/invitaciones/{id}` - Actualizar invitación
- `DELETE /api/invitaciones/{id}` - Eliminar invitación

#### Usuario-Local (`/api/usuario-locales`)
- `GET /api/usuario-locales` - Listar todas las relaciones
- `GET /api/usuario-locales/usuario/{usuarioId}` - Obtener por usuario
- `GET /api/usuario-locales/local/{localId}` - Obtener por local
- `POST /api/usuario-locales` - Crear relación
- `DELETE /api/usuario-locales/usuario/{usuarioId}/local/{localId}` - Eliminar relación

## Ejemplos de Uso

### 1. Registrar un nuevo usuario
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan@example.com",
    "contrasenia": "password123"
  }'
```

Respuesta:
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "email": "juan@example.com",
  "nombre": "Juan",
  "apellido": "Pérez",
  "id": 1
}
```

### 2. Iniciar sesión
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "contrasenia": "password123"
  }'
```

### 3. Crear un local (requiere token)
```bash
curl -X POST http://localhost:8080/api/locales \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {tu_token}" \
  -d '{
    "nombre": "Estudio General Central",
    "admin": {"id": 1}
  }'
```

### 4. Crear un item
```bash
curl -X POST http://localhost:8080/api/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {tu_token}" \
  -d '{
    "descripcion": "Guitarra Eléctrica Fender",
    "cantidad": 1,
    "usuario": {"id": 1},
    "local": {"id": 1}
  }'
```

### 5. Prestar un item
```bash
curl -X PUT http://localhost:8080/api/items/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {tu_token}" \
  -d '{
    "descripcion": "Guitarra Eléctrica Fender",
    "cantidad": 1,
    "usuario": {"id": 1},
    "local": {"id": 1},
    "prestadoA": {"id": 2}
  }'
```

## Seguridad

### Autenticación JWT
- Los tokens JWT tienen una validez de 10 horas
- El secret key debe cambiarse en producción
- Las contraseñas actualmente se guardan en texto plano (⚠️ implementar BCrypt para producción)

### CSRF
CSRF está deshabilitado ya que la API es stateless con JWT

### CORS
Por defecto no hay configuración de CORS (agregar según necesidad)

## Notas Importantes

⚠️ **Para producción:**
- Implementar hash de contraseñas con BCrypt
- Cambiar el JWT secret key
- Configurar CORS apropiadamente
- Agregar rate limiting
- Implementar logging apropiado
- Agregar validaciones de entrada
- Considerar usar HTTPS

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto es de código abierto.

---

# 📝 Mis Anotaciones Personales

## Tests en Postman

### TEST 1: Login exitoso
- POST `http://localhost:8080/api/auth/login`
- Body: `{"email":"juan@example.com","contrasenia":"password123"}`
- Verificar: Status 200 y que recibes el token

### TEST 2: Acceder a endpoint protegido SIN token (debe dar 403)
- GET `http://localhost:8080/api/usuarios`
- Sin header de Authorization
- Verificar: Status 403

### TEST 3: Acceder a endpoint protegido CON token (debe funcionar)
- GET `http://localhost:8080/api/usuarios`
- Headers: `Authorization: Bearer TU_TOKEN`
- Verificar: Status 200 y recibes la lista de usuarios

### TEST 4: Crear un local con autenticación
- POST `http://localhost:8080/api/locales`
- Headers: `Authorization: Bearer TU_TOKEN`
- Body: `{"nombre":"Mi Local Test","admin":{"id":2}}`
- Verificar: Status 201 y que se crea correctamente

### TEST 5: Register nuevo usuario
- POST `http://localhost:8080/api/auth/register`
- Body: `{"nombre":"Test","apellido":"User","email":"test@example.com","contrasenia":"test123"}`
- Verificar: Status 201 y recibes token

## Endpoints Públicos vs Protegidos

**Endpoints públicos (NO requieren token):**
- POST /api/auth/login - Para iniciar sesión
- POST /api/auth/register - Para registrar nuevos usuarios
- GET / - Página principal

**Endpoints protegidos (REQUIEREN token JWT):**
- Todos los demás endpoints (/api/usuarios, /api/locales, /api/items, etc.)

## Checklist de Features Implementadas

✅ Usuarios (CREATE, READ, UPDATE, DELETE)
✅ Locales (CREATE, READ, UPDATE, DELETE)
✅ UsuarioLocal (Relación Many-to-Many)
✅ Items (CREATE, READ, UPDATE con préstamos)
✅ Invitaciones (CREATE, READ, UPDATE, DELETE con estados)

## Repositories (5 archivos en /repository)

- **UsuarioRepository** - incluye `findByEmail()`
- **LocalRepository** - incluye `findByAdminId()`
- **UsuarioLocalRepository** - incluye `findByUsuarioId()`, `findByLocalId()`
- **ItemRepository** - incluye `findByUsuarioId()`, `findByLocalId()`, `findByPrestadoAId()`
- **InvitacionRepository** - incluye `findByDeId()`, `findByAId()`, `findByLocalId()`, `findByEstado()`

## Services (5 archivos en /service)

Cada servicio incluye:
- `findAll()` - Obtener todos los registros
- `findById()` - Obtener por ID
- `save()` - Crear o actualizar
- `deleteById()` - Eliminar por ID
- Más métodos personalizados basados en las queries del repositorio

## Controllers (5 controladores REST en /controller)

Cada controlador expone endpoints REST según se detalla arriba en la sección de API Endpoints.