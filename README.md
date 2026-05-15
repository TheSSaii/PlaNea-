# QuePlan (Monorepo)

This repository contains:
- `backend/`: NestJS + Prisma API
- `frontend/`: React + Vite web app
- `docker-compose.yml`: local dev stack (PostgreSQL + backend + frontend)

## Tech Stack

**Infrastructure / Containers**
- Docker Compose stack: PostgreSQL, backend, frontend (`docker-compose.yml`)
- PostgreSQL: `postgres:16-alpine` (`docker-compose.yml`)
- Backend container base image: `node:20-alpine` (`backend/Dockerfile`)
- Frontend container base image: `node:20-alpine` (`frontend/Dockerfile`)
- Frontend production image: `nginx:alpine` (`frontend/Dockerfile`)

**Backend (`backend/package.json`)**
- Node.js (container): 20.x (`backend/Dockerfile`)
- NestJS: `@nestjs/common` `^11.0.1`, `@nestjs/core` `^11.0.1`, `@nestjs/platform-express` `^11.0.1`
- Config: `@nestjs/config` `^4.0.4`
- Prisma: `prisma` `^6.7.0`, `@prisma/client` `^6.7.0`
- Validation: `joi` `^18.2.1`, `class-validator` `^0.15.1`, `class-transformer` `^0.5.1`
- Runtime libs: `rxjs` `^7.8.1`, `reflect-metadata` `^0.2.2`
- Testing: `jest` `^30.0.0`, `ts-jest` `^29.2.5`, `supertest` `^7.0.0`
- Lint/format: `eslint` `^9.18.0`, `prettier` `^3.4.2`, `eslint-plugin-prettier` `^5.2.2`, `eslint-config-prettier` `^10.0.1`, `typescript-eslint` `^8.20.0`
- TypeScript: `typescript` `^5.7.3`

**Frontend (`frontend/package.json`)**
- React: `react` `^19.2.5`, `react-dom` `^19.2.5`
- Routing: `react-router-dom` `^7.14.2`
- HTTP client: `axios` `^1.16.0`
- Build/dev server: `vite` `^8.0.10`, `@vitejs/plugin-react` `^6.0.1`
- TypeScript: `typescript` `~6.0.2`
- Lint: `eslint` `^10.2.1`, `typescript-eslint` `^8.58.2`, `eslint-plugin-react-hooks` `^7.1.1`, `eslint-plugin-react-refresh` `^0.5.2`

## Prerequisites

The repo does not pin exact Docker/Docker Compose versions, but it requires a Docker installation that supports the modern `docker compose` (Compose v2) command.

- Docker Engine: must support `docker compose`
  - Verify: `docker --version`
- Docker Compose (v2): must be available as a Docker subcommand
  - Verify: `docker compose version`

Node.js/npm are used inside containers via `node:20-alpine`. If you want to run the apps outside Docker, match the container runtime:
- Node.js: 20.x
  - Verify: `node -v`
- npm: the version bundled with your Node 20 install
  - Verify: `npm -v`

## Environment Setup

This repo includes a root `.env.example` used by `docker-compose.yml` variable interpolation.

1) Create your env file:
```bash
cp .env.example .env
```

2) Configure variables (from `.env.example`):

**Database (used by the `postgres` service and to compose `DATABASE_URL` for the backend container)**
- `DB_USER` (required): PostgreSQL user
- `DB_PASSWORD` (required): PostgreSQL password
- `DB_NAME` (required): PostgreSQL database name
- `DB_PORT` (required): host port to expose Postgres on (container is always `5432`)

**Backend**
- `JWT_SECRET` (required): secret used by the backend for JWT signing/verification (`docker-compose.yml`)
- `NODE_ENV` (optional): present in `.env.example`, but `docker-compose.yml` sets `NODE_ENV=development` for the backend container
- `PORT` (optional): present in `.env.example`, but `docker-compose.yml` sets `PORT=3000` for the backend container
- `DATABASE_URL` (optional for Compose): present in `.env.example`; the backend container receives its own `DATABASE_URL` composed from `DB_*` in `docker-compose.yml`

**Frontend**
- `VITE_API_URL` (optional for Compose): present in `.env.example`, but `docker-compose.yml` sets `VITE_API_URL=http://localhost:3000` for the frontend container

## Getting Started

1) Clone the repo:
```bash
git clone <REPO_URL>
cd <REPO_FOLDER>
```

2) Create `.env`:
```bash
cp .env.example .env
```

3) Start everything (fresh machine):
```bash
docker compose up -d --build
```

What happens on first boot:
- Postgres starts and is health-checked (`pg_isready`).
- Backend starts after Postgres is healthy and runs `npx prisma migrate deploy` via `backend/entrypoint.sh`.
- Frontend starts after the backend container is up.

## Common Commands

**Docker Compose lifecycle**
```bash
docker compose up -d --build
docker compose down
docker compose down -v
docker compose ps
docker compose restart backend
```

**Logs**
```bash
docker compose logs -f
docker compose logs -f postgres
docker compose logs -f backend
docker compose logs -f frontend
```

**Exec into containers**
```bash
docker compose exec backend sh
docker compose exec frontend sh
```

**Prisma (run from inside the backend container)**
```bash
# Generate client
docker compose exec backend npx prisma generate

# First migration (already exists in backend/prisma/migrations)
docker compose exec backend npx prisma migrate dev --name init

# Subsequent migrations after changing schema.prisma
docker compose exec backend npx prisma migrate dev --name <migration_name>

# Apply migrations without prompting (used by entrypoint)
docker compose exec backend npx prisma migrate deploy

# Migration status
docker compose exec backend npx prisma migrate status

# Prisma Studio
docker compose exec backend npx prisma studio --host 0.0.0.0 --port 5555
```
If you run Prisma Studio, expose the port by adding a port mapping for `backend` in `docker-compose.yml` (not currently configured).

## Project Structure

Top-level layout:
```text
.
├─ backend/
│  ├─ prisma/                 # Prisma schema + migrations
│  ├─ src/                    # NestJS application source
│  ├─ test/                   # Jest tests (including e2e config)
│  ├─ Dockerfile              # Node 20 multi-stage image (dev/builder/prod)
│  ├─ entrypoint.sh           # Runs migrations, then starts Nest
│  ├─ nest-cli.json           # Nest CLI config
│  ├─ tsconfig*.json          # TS config (build + base)
│  └─ eslint.config.mjs       # ESLint flat config (type-aware)
├─ frontend/
│  ├─ public/                 # Static assets served by Vite
│  ├─ src/                    # React app source
│  ├─ Dockerfile              # Node 20 dev + Nginx prod stages
│  ├─ vite.config.ts          # Vite config (React plugin)
│  ├─ tsconfig*.json          # TS project references
│  └─ eslint.config.js        # ESLint flat config for TS/React
├─ docker-compose.yml         # Postgres + backend + frontend dev stack
├─ .env.example               # Compose env template
└─ .env                       # Local env (should not be committed)
```

## Development Workflow

**Hot reload**
- Backend: `docker-compose.yml` mounts `./backend/src:/app/src` and starts `npm run start:dev` (Nest `--watch`).
- Frontend: `docker-compose.yml` mounts `./frontend/src:/app/src` and runs Vite with `--host 0.0.0.0` (HMR).

**Add a new Prisma model**
1) Edit `backend/prisma/schema.prisma`
2) Create and apply a migration:
```bash
docker compose exec backend npx prisma migrate dev --name <change_name>
```
3) Regenerate Prisma client (usually handled automatically by `migrate dev`, but can be run manually):
```bash
docker compose exec backend npx prisma generate
```

**Service URLs / ports (local machine)**
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Postgres: localhost:`DB_PORT` (defaults to `5432` in `.env.example`)

## Módulo Foro-Comunidad

### Descripción
Módulo de foro comunitario con publicaciones, comentarios, likes y panel de administración.

### Rutas frontend
| Ruta | Descripción |
|------|-------------|
| `/` | Lista de publicaciones |
| `/topic/:id` | Detalle de una publicación |
| `/new` | Crear nueva publicación |
| `/admin` | Panel de administración (contraseña: admin123) |

### Rutas backend (prefijo `/forum`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/forum/topics` | Obtener todos los temas |
| POST | `/forum/topics` | Crear tema (soporta imagen) |
| GET | `/forum/topics/:id` | Obtener tema por ID |
| DELETE | `/forum/topics/:id` | Eliminar tema (admin) |
| PATCH | `/forum/topics/:id` | Editar tema |
| POST | `/forum/topics/:id/comments` | Agregar comentario |
| DELETE | `/forum/topics/:topicId/comments/:commentId` | Eliminar comentario (admin) |
| POST | `/forum/topics/:id/like` | Dar o quitar like |
| GET | `/forum/topics/:id/likes` | Obtener likes |
| POST | `/forum/users/block` | Bloquear usuario (admin) |
| DELETE | `/forum/users/block/:username` | Desbloquear usuario (admin) |
| GET | `/forum/users/blocked` | Lista de usuarios bloqueados |

### Modelos en base de datos
- `ForumTopic` — temas del foro (incluye `imageUrl`)
- `ForumComment` — comentarios con soporte de hilos
- `ForumLike` — likes por usuario y tema
- `ForumBlockedUser` — usuarios bloqueados por el admin

### Dependencias del módulo
El módulo usa las siguientes dependencias que deben estar en `backend/package.json`:
- `@nestjs/platform-express` — para subida de imágenes
- `multer` — manejo de archivos
- `@types/multer` — tipos de TypeScript para multer

### Después de hacer pull
```bash
docker-compose exec backend npx prisma migrate dev
docker-compose exec backend npx prisma generate
docker-compose up -d
```

### Variables de entorno necesarias
En el archivo `.env` de la raíz del proyecto deben existir:
```env
DATABASE_URL=postgresql://postgres:changeme@postgres:5432/myapp_db
JWT_SECRET=super_secret_key_change_in_production
VITE_API_URL=http://localhost:3000
```

### Cómo probar el módulo

1. Asegúrate de tener Docker Desktop corriendo

2. Desde la raíz del proyecto (`QuePlan/`) ejecuta:
```bash
docker-compose up -d
```

3. Abre el navegador en:
   - **Foro:** http://localhost:5173/
   - **Nueva publicación:** http://localhost:5173/new
   - **Panel admin:** http://localhost:5173/admin
     - Contraseña: `admin123`

4. Para ver los logs del backend:
```bash
docker-compose logs backend --tail=50
```

5. Para ver los logs del frontend:
```bash
docker-compose logs frontend --tail=50
```

6. Para detener todo:
```bash
docker-compose down
```

### Dependencia faltante — importante
Si el backend falla con errores de tipos en multer, instala:
```bash
docker-compose exec backend npm install --save-dev @types/multer
```