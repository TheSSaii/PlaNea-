# QuePlan

QuePlan es una aplicacion web para organizar planes y actividades con otras personas. El proyecto esta armado como monorepo y actualmente incluye una API en NestJS, una app web en React/Vite y una base de datos PostgreSQL.

El flujo local esta pensado para desarrollo con Docker Compose: despues de clonar el repositorio, Docker construye las imagenes, instala dependencias, levanta PostgreSQL, aplica migraciones Prisma y arranca backend y frontend con recarga en caliente.

## Aplicacion

La app esta compuesta por estos dominios principales:

- Autenticacion y usuarios: registro, login, perfiles y emision de JWT.
- Planes: creacion, consulta, actualizacion, eliminacion y subplanes ordenables.
- Administracion: consulta y gestion administrativa de planes.
- Foro/comunidad: publicaciones, detalle de tema, comentarios, likes, bloqueo de usuarios y carga de imagenes.

La interfaz web actual expone el modulo de foro:

- `/`: listado de publicaciones.
- `/topic/:id`: detalle de una publicacion.
- `/new`: crear publicacion.
- `/admin`: panel de administracion del foro.

## Tecnologias

**Infraestructura**

- Docker Compose v2.
- PostgreSQL `16-alpine`.
- Node.js `20-alpine` para backend y frontend en desarrollo.
- Nginx `alpine` como imagen de produccion del frontend.

**Backend**

- NestJS 11.
- Prisma 6.19 con Prisma Client.
- PostgreSQL como base de datos.
- JWT con `@nestjs/jwt` y `passport-jwt`.
- `bcrypt` para hash de contrasenas.
- `class-validator`, `class-transformer` y `joi` para validacion.
- Jest, Supertest, ESLint, Prettier y TypeScript.

**Frontend**

- React 19.
- Vite 8.
- TypeScript 6.
- React Router 7.
- Axios.
- Tailwind CSS 3, PostCSS y Autoprefixer.
- ESLint con reglas para React Hooks y React Refresh.

## Arquitectura Del Proyecto

```text
.
├─ backend/
│  ├─ prisma/                 # Schema Prisma y migraciones
│  ├─ src/                    # API NestJS
│  ├─ Dockerfile              # Imagen multi-stage: base, development, builder, production
│  └─ entrypoint.sh           # Aplica migraciones y arranca Nest
├─ frontend/
│  ├─ public/                 # Assets publicos
│  ├─ src/                    # App React
│  ├─ Dockerfile              # Imagen multi-stage: base, development, builder, production
│  ├─ entrypoint.sh           # Verifica dependencias y arranca Vite
│  └─ .dockerignore           # Excluye node_modules, builds, logs y envs del contexto Docker
├─ docker-compose.yml         # Stack local: PostgreSQL, backend y frontend
├─ .env.example               # Ejemplo de variables locales
└─ README.md
```

## Servicios Docker

**postgres**

- Usa la imagen `postgres:16-alpine`.
- Expone el puerto `${DB_PORT:-5432}` del host hacia `5432` del contenedor.
- Guarda datos en el volumen Docker `postgres_data`.
- Tiene healthcheck con `pg_isready`.
- Usa defaults de desarrollo si no existe `.env`:
  - `DB_USER=postgres`
  - `DB_PASSWORD=changeme`
  - `DB_NAME=myapp_db`

**backend**

- Construye `backend/Dockerfile` con target `development`.
- Instala dependencias con `npm ci`.
- Genera Prisma Client durante la build con `npx prisma generate`.
- Espera a que PostgreSQL este healthy.
- Al iniciar ejecuta `backend/entrypoint.sh`, que corre:
  - `npx prisma migrate deploy`
  - `npm run start:dev`
- Expone:
  - API: `http://localhost:3000`
  - Debug Node: `localhost:9229`
- Monta `./backend/src` y `./backend/prisma` para desarrollo con hot reload y migraciones locales.

**frontend**

- Construye `frontend/Dockerfile` con target `development`.
- Instala dependencias con `npm ci`.
- Al iniciar ejecuta `frontend/entrypoint.sh`, que verifica que existan dependencias y arranca Vite.
- Expone la app en `http://localhost:5173`.
- Usa `VITE_API_URL=${VITE_API_URL:-http://localhost:3000}`.
- Monta `./frontend/src` y `./frontend/public` para HMR.

## Levantar El Proyecto En Local

Requisitos:

- Docker Engine funcionando.
- Docker Compose v2 disponible con el comando `docker compose`.

Verificacion rapida:

```bash
docker --version
docker compose version
docker ps
```

Flujo recomendado despues de clonar:

```bash
git clone <REPO_URL>
cd QuePlan
docker compose up -d --build
```

Con la configuracion actual, no es obligatorio crear `.env` para desarrollo local basico. `docker-compose.yml` incluye defaults de desarrollo para arrancar en local.

Si quieres personalizar variables, crea tu `.env`:

```bash
cp .env.example .env
```

Variables soportadas:

```env
DB_USER=postgres
DB_PASSWORD=changeme
DB_NAME=myapp_db
DB_PORT=5432
DATABASE_URL=postgresql://postgres:changeme@postgres:5432/myapp_db
NODE_ENV=development
PORT=3000
JWT_SECRET=super_secret_key_change_in_production
VITE_API_URL=http://localhost:3000
```

Nota: los defaults del `docker-compose.yml` son solo para desarrollo. Para ambientes compartidos, staging o produccion, define variables reales y cambia `JWT_SECRET`.

## URLs Locales

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- PostgreSQL: `localhost:${DB_PORT:-5432}`

## Comandos Comunes

Levantar todo reconstruyendo imagenes:

```bash
docker compose up -d --build
```

Levantar sin reconstruir:

```bash
docker compose up -d
```

Ver estado de servicios:

```bash
docker compose ps
```

Ver logs:

```bash
docker compose logs -f
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

Entrar a un contenedor:

```bash
docker compose exec backend sh
docker compose exec frontend sh
```

Detener servicios sin borrar datos:

```bash
docker compose down
```

Detener servicios y borrar la base local:

```bash
docker compose down -v
```

Usa `docker compose down -v` solo si quieres eliminar el volumen `postgres_data` y perder los datos locales.

## Migraciones Prisma

En el arranque normal no tienes que ejecutar migraciones manualmente. El backend aplica migraciones existentes con:

```bash
npx prisma migrate deploy
```

Ese comando se ejecuta dentro de `backend/entrypoint.sh` cada vez que inicia el contenedor.

Cuando cambies `backend/prisma/schema.prisma` durante desarrollo, crea una nueva migracion desde el contenedor:

```bash
docker compose exec backend npx prisma migrate dev --name <nombre_de_migracion>
```

Consultar estado de migraciones:

```bash
docker compose exec backend npx prisma migrate status
```

Regenerar Prisma Client manualmente si hace falta:

```bash
docker compose exec backend npx prisma generate
```

## Dependencias

No es necesario ejecutar `npm install` en el host para levantar el proyecto con Docker. Cada imagen instala sus dependencias con `npm ci` usando su respectivo `package-lock.json`.

Si agregas dependencias, actualiza siempre `package.json` y `package-lock.json` juntos:

```bash
cd backend
npm install <paquete>
cd ..
```

Para dependencias de desarrollo:

```bash
cd backend
npm install -D <paquete>
cd ..
```

Aplica el mismo criterio en `frontend/`.

Antes de commitear cambios de dependencias, puedes validar:

```bash
cd backend
npm ci --dry-run
cd ../frontend
npm ci --dry-run
cd ..
```

## Endpoints Principales

**Autenticacion**

- `POST /auth/register`
- `POST /auth/login`

**Usuarios**

- `GET /users/:id`
- `PATCH /users/:id`

**Planes**

- `POST /plans`
- `GET /plans`
- `GET /plans/:id`
- `PATCH /plans/:id`
- `DELETE /plans/:id`
- `POST /plans/:id/subplans`
- `PATCH /plans/:id/subplans/reorder`
- `DELETE /plans/:id/subplans/:subplanId`

**Administracion de planes**

- `GET /admin/plans/stats`
- `GET /admin/plans`
- `GET /admin/plans/:id`
- `PATCH /admin/plans/:id`
- `DELETE /admin/plans/:id`

**Foro**

- `GET /forum/topics`
- `POST /forum/topics`
- `GET /forum/topics/:id`
- `PATCH /forum/topics/:id`
- `DELETE /forum/topics/:id`
- `POST /forum/topics/:id/comments`
- `DELETE /forum/topics/:topicId/comments/:commentId`
- `POST /forum/topics/:id/like`
- `GET /forum/topics/:id/likes`
- `POST /forum/users/block`
- `DELETE /forum/users/block/:username`
- `GET /forum/users/blocked`

## Solucion De Problemas

Si Docker no tiene permisos en Linux:

```bash
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
newgrp docker
docker ps
```

Si Docker esta apuntando a Docker Desktop pero no esta corriendo:

```bash
docker context ls
docker context use default
docker ps
```

Si cambiaste dependencias y la build falla en `npm ci`, sincroniza el lockfile:

```bash
cd backend
npm install --package-lock-only
npm ci --dry-run
cd ..
```

Para frontend:

```bash
cd frontend
npm install --package-lock-only
npm ci --dry-run
cd ..
```

Luego reconstruye:

```bash
docker compose up -d --build
```
