# Frontend de Reservas - Especificaciones Completas

## 🎯 Sistema de Reservas

### Flujo de Reservas

**Reserva por Horas (Confirmación Inmediata):**
```
Usuario crea reserva con esReservaDiaCompleto = false
       ↓
Backend asigna automáticamente estado = CONFIRMADA
       ↓
Reserva lista para usar
```

**Reserva de Día Completo (Sistema de Aprobación):**
```
Usuario crea reserva con esReservaDiaCompleto = true
       ↓
Backend:
  - Asigna estado = PENDIENTE_APROBACIONES
  - Crea ReservaAprobacion para cada usuario del local
       ↓
Usuarios responden (aprobar/rechazar)
       ↓
Todos aprobaron → Estado = APROBADA
Alguien rechazó → Estado = RECHAZADA
       ↓
Reserva finalizada
```

Este archivo contiene las especificaciones completas para implementar el sistema de reservas.
Consulta este archivo para conocer:
- Endpoints de la API
- Modelos de datos
- Diseño de componentes
- Flujos de usuario
- Validaciones
