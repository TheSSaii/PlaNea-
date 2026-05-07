/**
 * LAYER: Data Access / Repository Pattern
 *
 * Define el contrato para acceso a datos de usuarios
 * Desacopla la lógica de negocio de la implementación de persistencia
 *
 * BENEFICIOS:
 * - Permite cambiar entre almacenamiento en memoria, BD, APIs externas, etc.
 * - Facilita testing con implementaciones mock
 * - Cada implementación (Prisma, In-Memory) cumple el mismo contrato
 */

import { User } from './user.entity';

/**
 * SYMBOL INJECTION TOKEN
 * Usado en NestJS para inyectar dinámicamente la implementación correcta
 * del repositorio en runtime
 *
 * Ventaja: El servicio no necesita importar clases concretas,
 * solo recibe la interfaz a través del símbolo de inyección
 */
export const USERS_REPOSITORY = Symbol('USERS_REPOSITORY');

/**
 * INTERFACE: UsersRepository
 *
 * Define el contrato de métodos que TODA implementación debe cumplir
 * Todos los métodos son async porque pueden acceder a BD u otros I/O
 *
 * MÉTODOS:
 * - findById(id): Busca usuario por ID único
 * - findByEmail(email): Busca usuario por email (único)
 * - save(user): Guarda/actualiza usuario en persistencia
 */
export interface UsersRepository {
  /**
   * Busca un usuario por su ID
   * FLUJO en repositorio Prisma:
   * 1. Ejecuta query: SELECT * FROM "User" WHERE id = $1
   * 2. Si existe: convierte datos DB a entidad User
   * 3. Si no existe: retorna null
   *
   * @param id ID del usuario (UUID)
   * @returns Promise<User | null> - Usuario si existe, null si no
   */
  findById(id: string): Promise<User | null>;

  /**
   * Busca un usuario por email
   * IMPORTANTE: Email es único en BD (UNIQUE constraint)
   *
   * FLUJO en repositorio Prisma:
   * 1. Normaliza el email (lowercase)
   * 2. Ejecuta query: SELECT * FROM "User" WHERE email = $1
   * 3. Si existe: convierte datos DB a entidad User
   * 4. Si no existe: retorna null
   *
   * @param email Email del usuario
   * @returns Promise<User | null> - Usuario si existe, null si no
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Guarda (crea o actualiza) un usuario en persistencia
   *
   * FLUJO en repositorio Prisma:
   * 1. Recibe una entidad User (validada)
   * 2. Convierte UserRole (User/Admin) a enum BD (USER/ADMIN)
   * 3. Ejecuta UPSERT: UPDATE si existe, INSERT si no
   * 4. Retorna la entidad guardada con datos actualizados
   *
   * UPSERT es importante porque:
   * - CREATE: cuando es un usuario nuevo
   * - UPDATE: cuando se actualiza un usuario existente (e.g., updateProfile)
   *
   * @param user Entidad User a guardar (debe estar validada)
   * @returns Promise<User> - Usuario guardado
   * @throws Error si ocurre un error de BD
   */
  save(user: User): Promise<User>;
}
