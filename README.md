# Sistema de Reservas de Canchas de Fútbol

Sistema web full-stack para gestionar reservas de canchas de fútbol, inspirado en [Reservio](https://www.reservio.com/es).

## Stack

- **Backend:** Node.js + Express + Sequelize + MySQL + JWT
- **Frontend:** React + Vite

## Estructura

```
reservas-canchas/
├── server/           # API REST
│   ├── src/
│   │   ├── config/   # Configuración DB
│   │   ├── models/   # Sequelize models
│   │   ├── routes/   # Rutas Express
│   │   ├── controllers/
│   │   ├── services/
│   │   └── middlewares/  # Auth JWT
├── client/           # Frontend React
│   ├── src/
│   │   ├── pages/    # Login, Reservar, Agenda, etc.
│   │   ├── components/
│   │   ├── api/      # Cliente HTTP
│   │   └── context/  # AuthContext
└── README.md
```

## Instalación y ejecución local

### 1. Clonar
```bash
git clone <url-del-repo>
cd reservas-canchas
```

### 2. Configurar variables de entorno
```bash
cp server/.env.example server/.env
# Editar server/.env con tus credenciales MySQL
cp client/.env.example client/.env
```

### 3. Crear la base de datos

En tu MySQL local, crea la base de datos que definiste en `.env`:

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS reservas_canchas;"
```

> El nombre debe coincidir con `DB_NAME` en `server/.env`.

### 4. Backend
```bash
cd server
npm install
npm run db:migrate   # Crear tablas en MySQL
npm run db:seed      # Datos de prueba
npm run dev          # http://localhost:3000
```

### 5. Frontend
```bash
cd client
npm install
npm run dev       # http://localhost:5173
```

### 6. Abrir
Ir a http://localhost:5173

## Usuarios de prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@canchas.cl | admin123 |
| Cliente | juan@correo.cl | 123456 |

## API Endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | /api/v1/auth/register | No | Registro |
| POST | /api/v1/auth/login | No | Login |
| GET | /api/v1/auth/perfil | Sí | Perfil usuario |
| GET | /api/v1/canchas | No | Listar canchas |
| POST | /api/v1/canchas | Admin | Crear cancha |
| PUT | /api/v1/canchas/:id | Admin | Editar cancha |
| DELETE | /api/v1/canchas/:id | Admin | Eliminar cancha |
| GET | /api/v1/disponibilidad/cancha/:id | No | Horarios de cancha |
| POST | /api/v1/disponibilidad | Admin | Configurar horarios |
| GET | /api/v1/reservas/slots | No | Slots disponibles |
| POST | /api/v1/reservas | Sí | Crear reserva |
| GET | /api/v1/reservas | Sí | Listar reservas |
| PUT | /api/v1/reservas/:id/cancelar | Sí | Cancelar reserva |
| GET | /api/v1/health | No | Health check |
