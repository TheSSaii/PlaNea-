/**
 * SERVICE LAYER: UsersService
 *
 * Lógica de negocio relacionada con usuarios
 * Orquesta entre controlador (HTTP) y repositorio (persistencia)
 *
 * RESPONSABILIDADES:
 * - Validar reglas de negocio (ej: email único)
 * - Aplicar transformaciones de datos
 * - Manejar excepciones de negocio
 * - Delegar persistencia al repositorio
 *
 * FLUJO ARQUITECTÓNICO:
 * Controller (HTTP) → UsersService (lógica) → UsersRepository (persistencia)
 */

import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserProps, User } from './user.entity';
import { USERS_REPOSITORY } from './users.repository';
import type { UsersRepository } from './users.repository';

/**
 * SERVICIO: UsersService
 * Inyectable en NestJS (@Injectable)
 */
@Injectable()
export class UsersService {
  /**
   * Constructor con inyección de dependencias
   *
   * @Inject(USERS_REPOSITORY) - Inyecta la implementación configurada
   * Esta puede ser:
   * - PrismaUsersRepository (producción): accede a PostgreSQL
   * - InMemoryUsersRepository (desarrollo): almacenamiento en memoria
   *
   * VENTAJA: El servicio no conoce qué implementación usa,
   * solo que cumple la interfaz UsersRepository
   */
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: UsersRepository,
  ) {}

  /**
   * CREAR nuevo usuario
   *
   * FLUJO:
   * 1. Normaliza el email a lowercase
   * 2. Valida que el email NO exista en BD (ConflictException si existe)
   * 3. Crea entidad User validada (normalización, validación)
   * 4. Delega al repositorio para guardar en BD
   * 5. Retorna usuario guardado
   *
   * VALIDACIONES APLICADAS:
   * - Email único (regla de negocio)
   * - Email formato válido (en User.create)
   * - Contraseña mínimo 20 caracteres = hash bcrypt (en User.create)
   * - Nombre 2-n caracteres (en User.create)
   * - Timestamps válidos (en User.create)
   *
   * EXCEPCIONES:
   * - ConflictException: Si email ya está registrado
   * - Error: Si validación de estructura falla
   *
   * @param input Datos para crear usuario
   *   - id: UUID generado (por quien llama, ej: auth.service)
   *   - email: Email del usuario
   *   - passwordHash: Hash bcrypt de la contraseña
   *   - name: Nombre del usuario
   *   - role: Optional, por defecto USER
   * @returns Promise<User> - Usuario creado en BD
   */
  async create(input: Omit<CreateUserProps, 'id'> & { id: string }): Promise<User> {
    const normalizedEmail = input.email.trim().toLowerCase();
    
    // Verifica unicidad de email ANTES de intentar crear
    const existingUser = await this.usersRepository.findByEmail(normalizedEmail);

    if (existingUser) {
      throw new ConflictException('Email is already registered.');
    }

    // User.create hace normalización y validación interna
    const user = User.create({
      ...input,
      email: normalizedEmail,
    });

    // Guarda en persistencia (Prisma/BD) y retorna
    return this.usersRepository.save(user);
  }

  /**
   * BUSCAR usuario por ID
   *
   * FLUJO:
   * 1. Busca en repositorio (BD)
   * 2. Si no existe: lanza NotFoundException (error de negocio)
   * 3. Si existe: retorna usuario
   *
   * EXCEPCIONES:
   * - NotFoundException: Si usuario no existe
   *
   * @param id ID del usuario (UUID)
   * @returns Promise<User> - Usuario encontrado
   * @throws NotFoundException si no existe
   */
  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return user;
  }

  /**
   * BUSCAR usuario por email
   *
   * FLUJO:
   * 1. Busca en repositorio (BD)
   * 2. Retorna usuario o null (sin lanzar excepción)
   *
   * NOTA: No lanza excepción porque se usa en login para validar credenciales
   * (es esperado que devuelva null si el email no existe)
   *
   * @param email Email del usuario
   * @returns Promise<User | null> - Usuario si existe, null si no
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  /**
   * ACTUALIZAR perfil del usuario
   *
   * FLUJO:
   * 1. Obtiene usuario actual (findById lanza excepción si no existe)
   * 2. Llama updateProfile() en entidad (retorna NUEVA instancia immutable)
   * 3. Guarda nueva instancia en persistencia
   * 4. Retorna usuario actualizado
   *
   * PATRÓN IMMUTABLE:
   * - User.updateProfile() NO modifica la instancia actual
   * - Retorna una NUEVA instancia con cambios
   * - Esto garantiza predictibilidad y facilita debugging
   *
   * EXCEPCIONES:
   * - NotFoundException: Si usuario no existe
   *
   * @param id ID del usuario a actualizar
   * @param updates Campo(s) a actualizar (name, etc)
   * @returns Promise<User> - Usuario actualizado en BD
   * @throws NotFoundException si usuario no existe
   */
  async updateProfile(id: string, updates: { name?: string }): Promise<User> {
    const currentUser = await this.findById(id);
    const updatedUser = currentUser.updateProfile(updates);
    return this.usersRepository.save(updatedUser);
  }
}
