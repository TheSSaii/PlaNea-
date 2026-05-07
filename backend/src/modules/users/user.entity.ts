/**
 * ENTITY: User
 *
 * Capa de dominio que representa la entidad de Usuario.
 * Encapsula la lógica y validación relacionada con usuarios.
 *
 * RESPONSABILIDADES:
 * - Representar un usuario con sus propiedades y metadata
 * - Validar la integridad de los datos del usuario
 * - Proporcionar métodos para transformar datos (toJSON, toPublicJSON, etc.)
 * - Ser immutable después de su creación
 */

/**
 * Enum que define los roles posibles de un usuario en el sistema
 */
export enum UserRole {
  User = 'user',
  Admin = 'admin',
}

/**
 * Interface que describe todas las propiedades de un usuario completo
 * Se usa internamente para mantener el estado del User
 */
export interface UserProps {
  id: string;
  email: string;
  passwordHash: string;
  name?: string | null;
  role?: UserRole | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface para crear un nuevo usuario
 * Algunas propiedades son opcionales porque se generan automáticamente
 * (timestamps si no se proporcionan)
 */
export interface CreateUserProps {
  id: string;
  email: string;
  passwordHash: string;
  name?: string | null;
  role?: UserRole | null;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface que define el payload de un JWT de usuario
 * Se usa para codificar datos en el token de autenticación
 */
export interface UserJwtPayload {
  sub: string;      // subject: id del usuario
  email: string;
  role: UserRole;
}

/**
 * CLASE User - Entidad de dominio
 *
 * Propiedades:
 * - Todas las propiedades son readonly (immutable)
 * - Constructor privado: se debe usar User.create() para instanciar
 * - Validación automática al crear o actualizar
 *
 * Métodos principales:
 * - create(): Factory method para crear nuevas instancias
 * - updateProfile(): Retorna una NUEVA instancia con cambios (no modifica la actual)
 * - toJSON(): Retorna todas las propiedades incluyendo passwordHash
 * - toPublicJSON(): Retorna datos públicos sin passwordHash (para API responses)
 * - toJwtPayload(): Prepara datos para token JWT
 */
export class User {
  readonly id: string;
  readonly email: string;
  readonly passwordHash: string;
  readonly name: string | null;
  readonly role: UserRole;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  /**
   * Constructor privado - no se llama directamente
   * Uso: User.create() en su lugar
   *
   * @param props Propiedades del usuario validadas
   */
  private constructor(props: UserProps) {
    this.id = props.id;
    this.email = props.email;
    this.passwordHash = props.passwordHash;
    this.name = props.name ?? null;
    this.role = props.role ?? UserRole.User;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  /**
   * Factory method para crear una nueva instancia de User
   * FLUJO:
   * 1. Normaliza los datos (email lowercase, espacios en nombre)
   * 2. Establece timestamps por defecto si no se proporcionan
   * 3. Valida la estructura completa
   * 4. Retorna una nueva instancia immutable
   *
   * @param props Datos del usuario (con validación automática)
   * @returns User - Nueva instancia validada
   * @throws Error si la estructura no es válida
   */
  static create(props: CreateUserProps): User {
    const createdAt = props.createdAt ?? new Date();
    const userProps: UserProps = {
      id: props.id.trim(),
      email: normalizeEmail(props.email),
      passwordHash: props.passwordHash.trim(),
      name: props.name ? normalizeName(props.name) : null,
      role: props.role ?? UserRole.User,
      createdAt,
      updatedAt: props.updatedAt ?? createdAt,
    };

    validateUserStructure(userProps);

    return new User(userProps);
  }

  /**
   * Actualiza el perfil del usuario
   * IMPORTANTE: Retorna una NUEVA instancia, no modifica la actual (patrón immutable)
   * FLUJO:
   * 1. Clona los datos actuales
   * 2. Aplica cambios solicitados
   * 3. Actualiza el timestamp updatedAt
   * 4. Valida la nueva estructura
   * 5. Retorna nueva instancia
   *
   * @param props Campo(s) a actualizar (actualmente solo name)
   * @returns User - Nueva instancia con cambios aplicados
   * @throws Error si la validación falla
   */
  updateProfile(props: { name?: string }): User {
    const nextUser = new User({
      ...this.toJSON(),
      name: props.name !== undefined ? normalizeName(props.name) : this.name,
      updatedAt: new Date(),
    });

    validateUserStructure(nextUser.toJSON());
    return nextUser;
  }

  /**
   * Convierte la instancia a un objeto JSON
   * Incluye TODAS las propiedades, incluyendo passwordHash
   * ADVERTENCIA: No usar en responses HTTP públicas, usar toPublicJSON() en su lugar
   *
   * @returns UserProps - Objeto con todas las propiedades del usuario
   */
  toJSON(): UserProps {
    return {
      id: this.id,
      email: this.email,
      passwordHash: this.passwordHash,
      name: this.name,
      role: this.role,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Convierte a JSON para respuestas públicas
   * Excluye el passwordHash por seguridad
   * USO: Respuestas HTTP, DTOs de salida
   *
   * @returns Objeto sin passwordHash, seguro para enviar al cliente
   */
  toPublicJSON(): Omit<UserProps, 'passwordHash'> {
    const { passwordHash: _passwordHash, ...publicUser } = this.toJSON();
    return publicUser;
  }

  /**
   * Prepara los datos para codificar en un JWT
   * Incluye solo la información necesaria para autenticación
   *
   * @returns UserJwtPayload - Datos para token JWT
   */
  toJwtPayload(): UserJwtPayload {
    return {
      sub: this.id,
      email: this.email,
      role: this.role,
    };
  }
}

/**
 * VALIDACIÓN de estructura de usuario
 *
 * Se ejecuta automáticamente en User.create() y updateProfile()
 * Garantiza la integridad de los datos antes de persistir
 *
 * VALIDACIONES:
 * - id: requerido y no vacío
 * - email: formato válido (simple regex)
 * - passwordHash: mínimo 20 caracteres (indica hash bcrypt)
 * - name: entre 2-n caracteres si está definido
 * - timestamps: deben ser Date válidos
 *
 * @param user Objeto UserProps a validar
 * @throws Error si alguna validación falla
 */
export function validateUserStructure(user: UserProps): void {
  if (!user.id) {
    throw new Error('User.id is required.');
  }

  if (!isValidEmail(user.email)) {
    throw new Error('User.email must be a valid email address.');
  }

  if (!user.passwordHash || user.passwordHash.length < 20) {
    throw new Error('User.passwordHash must look like a hashed password.');
  }

  if (user.name !== null && user.name !== undefined && user.name.length < 2) {
    throw new Error('User.name must contain at least 2 characters.');
  }

  if (!(user.createdAt instanceof Date) || Number.isNaN(user.createdAt.getTime())) {
    throw new Error('User.createdAt must be a valid date.');
  }

  if (!(user.updatedAt instanceof Date) || Number.isNaN(user.updatedAt.getTime())) {
    throw new Error('User.updatedAt must be a valid date.');
  }
}

/**
 * Normaliza un email
 * - Trim: elimina espacios al inicio y final
 * - Lowercase: convierte a minúsculas (emails son case-insensitive)
 * Garantiza consistencia para búsquedas y comparaciones
 *
 * @param email Email sin procesar
 * @returns Email normalizado
 */
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Normaliza un nombre
 * - Trim: elimina espacios al inicio y final
 * - Reemplaza múltiples espacios por uno solo
 * Mejora consistencia visual
 *
 * @param name Nombre sin procesar
 * @returns Nombre normalizado
 */
function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

/**
 * Valida que el email sea un formato válido
 * Usa regex simple: debe tener @ y un dominio
 * NOTA: Para validación exhaustiva considerar usar validadores más robustos
 *
 * @param email Email a validar
 * @returns true si el formato es válido
 */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
