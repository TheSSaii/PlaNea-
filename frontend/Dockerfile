# frontend/Dockerfile
FROM node:20-alpine AS base
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Desarrollo con hot reload (Vite HMR)
FROM base AS development
WORKDIR /app

COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

EXPOSE 5173
CMD ["sh", "./entrypoint.sh"]

# Build de producción
FROM base AS builder
RUN npm run build

FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
