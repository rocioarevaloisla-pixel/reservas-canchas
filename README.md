# Sistema de Reservas de Canchas

Sistema web full-stack para gestionar reservas de canchas deportivas, inspirado en [Reservio](https://www.reservio.com/es). Permite a clientes reservar canchas por hora, seleccionar servicios profesionales adicionales, y al administrador gestionar canchas, horarios, profesionales y reservas.

## Stack

- **Backend:** Node.js + Express + Sequelize (ORM) + MySQL + JWT
- **Frontend:** React 18 + Vite + React Router v6
- **Deploy:** API en Railway · Frontend en Vercel o Railway

## Estructura del repositorio

```
reservas-canchas/
├── front/                     # Frontend React + Vite
│   ├── src/
│   │   ├── api/client.js       # Cliente HTTP con JWT
│   │   ├── components/         # Componentes reutilizables
│   │   ├── context/            # AuthContext (login/register/logout)
│   │   └── pages/              # Landing, Dashboard, Reservar, MisReservas,
│   │                              Agenda, AdminReservas, Profesionales, etc.
│   ├── .env.example
│   └── package.json
├── back/                       # API REST Express
│   ├── src/
│   │   ├── config/             # database.js, config.js (puerto, JWT secret)
│   │   ├── models/             # Modelos Sequelize
│   │   ├── routes/             # Rutas Express
│   │   ├── controllers/        # Controladores
│   │   ├── services/           # Lógica de negocio
│   │   └── middlewares/        # Auth JWT, error handler
│   ├── migrations/             # Migraciones Sequelize
│   ├── seeders/                # Datos de prueba
│   ├── .env.example
│   └── package.json
├── .gitignore
└── README.md
```

## Instalación y ejecución local

### Requisitos

- Node.js 18+
- MySQL 8+ corriendo en el sistema

### 1. Clonar e instalar dependencias

```bash
git clone <url-del-repo>
cd reservas-canchas

# Backend
cd server
npm install
cd ..

# Frontend
cd client
npm install
cd ..
```

### 2. Configurar variables de entorno

```bash
# Backend: copiar y editar con tus credenciales MySQL
cp back/.env.example back/.env

# Frontend
cp front/.env.example front/.env
```

Editar `back/.env`:

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | URL de conexión MySQL (opcional, usar variables individuales) |
| `DB_HOST` | Host de MySQL (ej: `localhost`) |
| `DB_PORT` | Puerto (ej: `3306`) |
| `DB_NAME` | Nombre de la base de datos (ej: `reservas_canchas`) |
| `DB_USER` | Usuario MySQL (ej: `root`) |
| `DB_PASSWORD` | Contraseña MySQL |
| `PORT` | Puerto del servidor (ej: `3000`) |
| `JWT_SECRET` | Secreto para firmar JWT |
| `CORS_ORIGIN` | Origen del frontend (ej: `http://localhost:5173`) |

El archivo `front/.env` ya tiene el valor correcto para desarrollo:
```
VITE_API_URL=/api/v1
```

### 3. Crear la base de datos

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS reservas_canchas;"
```

### 4. Ejecutar migraciones y seeders

```bash
cd server
npm run db:migrate      # Crea las tablas
npm run db:seed         # Población inicial (usuarios, canchas, horarios)
```

### 5. Iniciar servidores

```bash
# Terminal 1 - Backend (puerto 3000)
cd server
npm run dev

# Terminal 2 - Frontend (puerto 5173)
cd client
npm run dev
```

### 6. Abrir

Ir a http://localhost:5173

## Usuarios de prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Administrador | admin@canchas.cl | admin123 |
| Cliente | juan@correo.cl | 123456 |

## Funcionalidades

### Cliente
- Registro e inicio de sesión
- Explorar canchas disponibles
- Reservar cancha seleccionando fecha y horario (slots de 1 hora)
- Seleccionar múltiples slots consecutivos
- Contratar servicios profesionales adicionales
- Ver boleta de confirmación antes de reservar
- Ver calendario con días de reservas propias
- Cancelar reservas activas
- Recibir notificaciones (reserva creada, cancelada, confirmación profesional)

### Administrador
- CRUD de canchas (con imagen)
- Configurar horarios por día de la semana
- CRUD de profesionales (con teléfono y email de contacto)
- Asignar profesionales a canchas
- CRUD de servicios por profesional
- Gestionar reservas (ver todas, cancelar)
- Confirmar/rechazar asistencia de profesional
- Vista de agenda con calendario mensual

## API Endpoints

### Autenticación
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/v1/auth/register` | No | Registro de usuario |
| POST | `/api/v1/auth/login` | No | Inicio de sesión |
| GET | `/api/v1/auth/perfil` | Sí | Perfil del usuario autenticado |

### Canchas
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/v1/canchas` | No | Listar canchas activas |
| POST | `/api/v1/canchas` | Admin | Crear cancha |
| PUT | `/api/v1/canchas/:id` | Admin | Actualizar cancha |
| DELETE | `/api/v1/canchas/:id` | Admin | Eliminar cancha |

### Disponibilidad
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/v1/disponibilidad/cancha/:id` | No | Obtener horarios de una cancha |
| POST | `/api/v1/disponibilidad` | Admin | Configurar horarios |
| DELETE | `/api/v1/disponibilidad/:id` | Admin | Eliminar horario |

### Reservas
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/v1/reservas/slots?canchaId=&fecha=` | Sí | Slots disponibles para una cancha y fecha |
| GET | `/api/v1/reservas/resumen-mes?ano=&mes=` | No | Resumen de reservas por día (admin) |
| GET | `/api/v1/reservas/resumen-mes-usuario?ano=&mes=` | Sí | Resumen de reservas propias por día |
| POST | `/api/v1/reservas` | Sí | Crear reserva |
| GET | `/api/v1/reservas` | Sí | Listar reservas (propias o todas si admin) |
| PUT | `/api/v1/reservas/:id/cancelar` | Sí | Cancelar reserva |
| PUT | `/api/v1/reservas/:id/confirmar-profesional` | Admin | Confirmar/rechazar profesional |

### Profesionales
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/v1/profesionales` | No | Listar profesionales activos |
| POST | `/api/v1/profesionales` | Admin | Crear profesional |
| PUT | `/api/v1/profesionales/:id` | Admin | Actualizar profesional |
| DELETE | `/api/v1/profesionales/:id` | Admin | Desactivar profesional |
| DELETE | `/api/v1/profesionales/:id/permanente` | Admin | Eliminar permanentemente |
| PUT | `/api/v1/profesionales/:id/canchas` | Admin | Asignar canchas a profesional |

### Servicios
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/v1/servicios/profesional/:id` | No | Listar servicios de un profesional |
| GET | `/api/v1/servicios/:id` | No | Obtener servicio |
| POST | `/api/v1/servicios/profesional/:id` | Admin | Crear servicio |
| PUT | `/api/v1/servicios/:id` | Admin | Actualizar servicio |
| DELETE | `/api/v1/servicios/:id` | Admin | Eliminar servicio |

### Notificaciones
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/v1/notificaciones-usuario` | Sí | Listar notificaciones del usuario |
| GET | `/api/v1/notificaciones-usuario/contar` | Sí | Contar notificaciones no leídas |
| PUT | `/api/v1/notificaciones-usuario/:id/leer` | Sí | Marcar notificación como leída |

### Salud
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/v1/health` | No | Health check |

## Modelo de datos

- **User** — Usuarios del sistema (admin, cliente)
- **Cancha** — Canchas deportivas reservables
- **Disponibilidad** — Horarios disponibles por cancha y día de semana
- **Reserva** — Reservas de cancha por cliente
- **Profesional** — Profesionales asociados a canchas
- **Servicio** — Servicios adicionales ofrecidos por profesionales
- **NotificacionUsuario** — Notificaciones para clientes
- **CanchaProfesionales** — Tabla pivote N:M entre canchas y profesionales

## Variables de entorno

Ver `back/.env.example` y `front/.env.example`.

**Importante:** No commitear archivos `.env` con credenciales reales.
