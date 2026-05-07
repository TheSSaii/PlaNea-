/**
 * MODULE: UsersModule
 *
 * Agrupa toda la funcionalidad de gestión de usuarios
 * - Controllers: Expone endpoints HTTP para usuarios (/users/:id, /users/:id patches)
 * - Services: Lógica de negocio (crear, buscar, actualizar)
 * - Repositories: Acceso a datos (interfaz y implementaciones)
 * - Imports: Dependencias (PrismaModule para BD)
 *
 * RESPONSABILIDADES:
 * - Gestionar ciclo de vida de usuarios
 * - Persistir/recuperar usuarios de BD
 * - Exportar UsersService para que otros módulos lo usen (AuthModule)
 * - Inyectar implementación correcta de repositorio
 *
 * PATRON INYECCION DE DEPENDENCIAS:
 * - Define interfaz UsersRepository (contrato)
 * - Proporciona implementación PrismaUsersRepository (Prisma + PostgreSQL)
 * - Cualquier cambio a BD: solo reemplaza PrismaUsersRepository
 * - Resto del código (service, controller) NO se modifica
 */

import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaUsersRepository } from './infrastructure/prisma-users.repository';
import { USERS_REPOSITORY } from './users.repository';
import { PrismaModule } from '../../prisma/prisma.module';

/**
 * CONFIGURACIÓN: UsersModule
 */
@Module({
  /**
   * IMPORTS: Módulos que este módulo necesita
   *
   * PrismaModule:
   * - Proporciona: PrismaService (cliente Prisma + conexión a BD)
   * - Razón: PrismaUsersRepository necesita acceder a BD
   *
   * FLUJO:
   * 1. PrismaService conecta a PostgreSQL (onModuleInit)
   * 2. PrismaUsersRepository lo inyecta
   * 3. UsersService lo inyecta vía USERS_REPOSITORY token
   */
  imports: [PrismaModule],

  /**
   * CONTROLLERS: Endpoints HTTP expuestos por este módulo
   * - UsersController: GET /users/:id, PATCH /users/:id
   */
  controllers: [UsersController],

  /**
   * PROVIDERS: Servicios y tokens de inyección que viven en este módulo
   *
   * UsersService:
   * - Lógica de negocio (crear, buscar, actualizar)
   * - Dependencia: recibe USERS_REPOSITORY token (inyectado)
   *
   * PrismaUsersRepository:
   * - Implementación de UsersRepository para Prisma + PostgreSQL
   * - Ejecuta queries contra BD
   *
   * USERS_REPOSITORY (custom provider):
   * - Token de inyección (Symbol)
   * - Mapea token → useExisting: PrismaUsersRepository
   * - Cuando UsersService pide @Inject(USERS_REPOSITORY):
   *   NestJS inyecta la instancia de PrismaUsersRepository
   *
   * VENTAJA:
   * - UsersService NO importa PrismaUsersRepository directamente
   * - Solo recibe interfaz vía token
   * - Facilita testing (inyectar mock) y cambios de implementación
   *
   * ALTERNATIVA: Si fuera in-memory (development):
   * providers: [
   *   UsersService,
   *   InMemoryUsersRepository,
   *   { provide: USERS_REPOSITORY, useExisting: InMemoryUsersRepository }
   * ]
   */
  providers: [
    UsersService,
    PrismaUsersRepository,
    {
      provide: USERS_REPOSITORY,
      useExisting: PrismaUsersRepository,
    },
  ],

  /**
   * EXPORTS: Servicios que otros módulos pueden importar
   * - UsersService: Exportado para que AuthModule lo use
   *
   * FLUJO:
   * 1. AuthModule importa UsersModule
   * 2. AuthModule recibe UsersService
   * 3. AuthService lo inyecta y lo usa para crear/buscar usuarios
   *
   * NOTA: USERS_REPOSITORY NO se exporta (es interno)
   */
  exports: [UsersService],
})
export class UsersModule {}
