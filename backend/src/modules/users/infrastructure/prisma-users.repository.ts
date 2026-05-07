/**
 * REPOSITORY IMPLEMENTATION: PrismaUsersRepository
 *
 * Implementación concreta de UsersRepository usando Prisma + PostgreSQL
 * Responsable de traducir operaciones entre la entidad User (dominio) y la BD
 *
 * RESPONSABILIDADES:
 * - Ejecutar queries Prisma contra PostgreSQL
 * - Mapear datos de BD a entidades User del dominio
 * - Mapear entidades User a formato para grabar en BD
 * - Manejar errores de BD
 *
 * VENTAJAS DE ESTE DESIGN:
 * - Si necesitas cambiar a otra BD (MongoDB, Firebase, etc):
 *   solo creas otra implementación de UsersRepository
 * - El resto del código (services, controllers) NO se modifica
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { User, UserRole } from '../user.entity';
import { UsersRepository } from '../users.repository';

/**
 * REPOSITORIO: PrismaUsersRepository
 * Implementa la interfaz UsersRepository usando Prisma
 */
@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  /**
   * Inyección de PrismaService (cliente Prisma + BD)
   * PrismaService extiende PrismaClient y maneja conexión automática
   */
  constructor(private readonly prisma: PrismaService) {}

  /**
   * BUSCAR usuario por ID
   *
   * QUERY SQL GENERADA (aprox):
   * SELECT * FROM "User" WHERE id = $1
   *
   * FLUJO:
   * 1. Ejecuta findUnique en tabla User
   * 2. Si existe: mapea datos BD a entidad User
   * 3. Si no existe: retorna null
   * 4. Si error BD: logea y retorna null (no falla el API)
   *
   * ERROR HANDLING:
   * - Captura errores (conexión, timeouts, etc)
   * - Logea para debugging
   * - Retorna null en vez de lanzar (permite que controller maneje 404)
   *
   * @param id UUID del usuario
   * @returns User si existe, null si no o si hay error
   */
  async findById(id: string): Promise<User | null> {
    try {
      const userData = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!userData) {
        return null;
      }

      return this.mapPrismaUserToEntity(userData);
    } catch (error) {
      console.error('[PrismaUsersRepository] Error finding user by id:', error);
      return null;
    }
  }

  /**
   * BUSCAR usuario por email
   *
   * QUERY SQL GENERADA (aprox):
   * SELECT * FROM "User" WHERE email = $1
   *
   * NOTES:
   * - Email tiene UNIQUE constraint en BD (no puede haber duplicados)
   * - Por eso usamos findUnique en lugar de findFirst
   * - Email se normaliza a lowercase para búsqueda
   *
   * FLUJO:
   * 1. Normaliza email a lowercase (consistencia)
   * 2. Ejecuta findUnique en tabla User
   * 3. Si existe: mapea datos BD a entidad User
   * 4. Si no existe: retorna null
   * 5. Si error BD: logea y retorna null
   *
   * @param email Email del usuario
   * @returns User si existe, null si no o si hay error
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const userData = await this.prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (!userData) {
        return null;
      }

      return this.mapPrismaUserToEntity(userData);
    } catch (error) {
      console.error('[PrismaUsersRepository] Error finding user by email:', error);
      return null;
    }
  }

  /**
   * GUARDAR usuario (crear o actualizar)
   *
   * OPERACIÓN UPSERT (INSERT OR UPDATE):
   * - Si el usuario NO existe (by id): INSERT (CREATE)
   * - Si el usuario existe (by id): UPDATE
   *
   * QUERY SQL GENERADA (aprox):
   * BEGIN TRANSACTION
   *   UPDATE "User" SET ... WHERE id = $1
   *   IF NOT FOUND:
   *     INSERT INTO "User" (id, email, ...) VALUES (...)
   * COMMIT
   *
   * RAZÓN DE UPSERT:
   * - create(): primer guardado, el usuario no existe en BD → INSERT
   * - updateProfile(): usuario ya existe en BD → UPDATE
   * - Con UPSERT manejamos ambos casos automáticamente
   *
   * CONVERSIÓN DE TIPOS:
   * - Entrada: User entity con role: UserRole.User | UserRole.Admin
   * - BD espera: role: 'USER' | 'ADMIN' (strings del enum Prisma)
   * - Conversión: UserRole.Admin → 'ADMIN', UserRole.User → 'USER'
   *
   * FLUJO:
   * 1. Extrae propiedades del User entity (user.toJSON())
   * 2. Convierte role enum a string para BD
   * 3. Ejecuta UPSERT en tabla User
   * 4. Mapea resultado BD a entidad User
   * 5. Retorna usuario guardado (con datos sync de BD)
   *
   * ERROR HANDLING:
   * - Lanzar excepciones (no retorna null)
   * - Caller (UsersService) decide cómo manejar
   *
   * @param user User entity validada
   * @returns User guardada en BD (con IDs, timestamps BD, etc)
   * @throws Error si error crítico de BD
   */
  async save(user: User): Promise<User> {
    try {
      const userJson = user.toJSON();
      // Convierte UserRole enum a string de BD
      const role = userJson.role === UserRole.Admin ? 'ADMIN' : 'USER';

      // UPSERT automáticamente elige INSERT o UPDATE según el where
      const userData = await this.prisma.user.upsert({
        where: { id: userJson.id },
        update: {
          email: userJson.email,
          passwordHash: userJson.passwordHash,
          name: userJson.name,
          role,
          updatedAt: userJson.updatedAt,
        },
        create: {
          id: userJson.id,
          email: userJson.email,
          passwordHash: userJson.passwordHash,
          name: userJson.name,
          role,
          createdAt: userJson.createdAt,
          updatedAt: userJson.updatedAt,
        },
      });

      return this.mapPrismaUserToEntity(userData);
    } catch (error) {
      console.error('[PrismaUsersRepository] Error saving user:', error);
      throw error;
    }
  }

  /**
   * MAPEO: Datos Prisma → Entidad User (dominio)
   *
   * RESPONSABILIDAD:
   * - Convertir datos de BD a formato que espera User.create()
   * - Traducir tipos: role 'ADMIN'/'USER' → UserRole enum
   * - Garantizar que los datos cumplen validaciones
   *
   * PROCESO:
   * 1. Recibe objeto del resultado Prisma query
   * 2. Extrae propiedades necesarias
   * 3. Convierte role string BD a enum UserRole
   * 4. Llama User.create() que valida y retorna instancia
   *
   * VALIDACIONES AUTOMÁTICAS:
   * - User.create() ejecuta validateUserStructure() internamente
   * - Si datos BD violan validación → lanzar Error
   * - Esto garantiza que NUNCA hay datos inconsistentes en memoria
   *
   * @param prismaUser Resultado de query Prisma
   * @returns User - Entidad validada
   * @throws Error si validación de User.create() falla
   */
  private mapPrismaUserToEntity(prismaUser: any): User {
    return User.create({
      id: prismaUser.id,
      email: prismaUser.email,
      passwordHash: prismaUser.passwordHash,
      name: prismaUser.name,
      // Convierte string de BD a enum dominio
      role: prismaUser.role === 'ADMIN' ? UserRole.Admin : UserRole.User,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    });
  }
}
