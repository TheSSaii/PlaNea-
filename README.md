# PlaNea!

Modern collaborative planning platform focused on productivity, social interaction and scalable full-stack architecture.

## Overview

PlaNea! is an independent evolution of a university collaborative planning project.

The project is currently being redesigned with focus on:

- scalable backend architecture
- authentication and security
- developer experience
- modular full-stack development
- collaborative planning features
- community interaction systems

The platform allows users to create and manage personal plans, interact through community forums and organize activities in a centralized environment.

---

## Tech Stack

### Backend

- NestJS
- Prisma ORM
- PostgreSQL
- JWT Authentication
- bcrypt
- TypeScript

### Frontend

- React
- Vite
- TypeScript
- React Router
- Tailwind CSS
- Axios

### Infrastructure

- Docker
- Docker Compose
- PostgreSQL 16

---

## Project Structure

```text
.
├── backend/
├── frontend/
├── docker-compose.yml
└── README.md
```

---

## Features

### Current Features

- User authentication
- JWT authorization
- Password hashing with bcrypt
- Plan management
- Community forum
- Topic creation and discussion
- Likes and comments system
- Administrative moderation tools
- Dockerized local development environment

### Planned Improvements

- Password recovery
- Email verification
- Refresh token rotation
- Middleware refactor
- Global error handling
- Role-based permissions
- Notifications
- Real-time features
- Collaborative plans
- AI-assisted planning features
- Improved UI/UX architecture
- Testing and CI/CD integration

---

## Local Development

### Requirements

- Docker
- Docker Compose

### Run Locally

```bash
git clone <REPOSITORY_URL>
cd planea
docker compose up -d --build
```

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:3000
```

---

## Environment Variables

Create a `.env` file if you want to customize local configuration:

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

---

## Useful Commands

### Start Services

```bash
docker compose up -d
```

### Rebuild Containers

```bash
docker compose up -d --build
```

### Stop Services

```bash
docker compose down
```

### Remove Containers and Database Volume

```bash
docker compose down -v
```

### View Logs

```bash
docker compose logs -f
```

---

## Prisma Migrations

Create a new migration:

```bash
docker compose exec backend npx prisma migrate dev --name migration_name
```

Check migration status:

```bash
docker compose exec backend npx prisma migrate status
```

Generate Prisma Client:

```bash
docker compose exec backend npx prisma generate
```

---

## Vision

PlaNea! aims to evolve into a modern collaborative productivity platform combining planning, organization, social interaction and intelligent assistance tools.

---

## Attribution

This project originated from a university team project developed collaboratively with classmates.

PlaNea! is my independent continuation and technical evolution of the original project, focused on architecture, scalability, maintainability and new features.

Original repository:
https://github.com/Cristian2403/QuePlan