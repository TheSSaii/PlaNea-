/**
 * SERVICE LAYER: AuthService
 *
 * Lógica de autenticación: registro y login
 * Orquesta entre DTOs, UsersService, JWT y hash de contraseña
 *
 * RESPONSABILIDADES:
 * - Hash de contraseñas (bcrypt)
 * - Comparación segura de contraseñas
 * - Generación de JWT tokens
 * - Orquestación de flujos de autenticación
 *
 * DEPENDENCIAS EXTERNAS:
 * - bcrypt: hash y comparación de contraseñas
 * - JwtService: generación y validación de JWT tokens
 * - UsersService: persistencia de usuarios
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';
import { compare, hash } from 'bcrypt';
import { LoginAuthDto } from './dto/login-auth.dto';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';

/**
 * SERVICIO: AuthService
 * Inyectable en NestJS
 */
@Injectable()
export class AuthService {
  /**
   * Inyección de dependencias:
   * - UsersService: para crear/buscar usuarios
   * - JwtService: para generar tokens JWT
   */
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * REGISTRO de nuevo usuario
   *
   * FLUJO:
   * 1. Recibe DTO con email, password, name
   * 2. Genera hash bcrypt de la contraseña (10 rounds)
   * 3. Crea UUID para el nuevo usuario
   * 4. Delega a UsersService.create() que:
   *    - Valida email único
   *    - Crea entidad User validada
   *    - Guarda en BD vía repositorio
   * 5. Construye response con usuario + JWT token
   * 6. Retorna al cliente
   *
   * SEGURIDAD:
   * - Contraseña NUNCA se almacena en texto plano, solo hash
   * - Hash tiene 10 rounds de salting (costo computacional)
   * - Respuesta NO incluye passwordHash (toPublicJSON)
   * - JWT token es httpOnly en cliente (idealmente)
   *
   * ERROR HANDLING:
   * - ConflictException: Si email ya existe (del UsersService)
   * - Error: Si validación falla
   *
   * @param userObject DTO con email, password, name
   * @returns Promise con { user, accessToken }
   *
   * PAYLOAD ESPERADO:
   * {
   *   "email": "john@example.com",
   *   "password": "securePass123",
   *   "name": "John Doe"
   * }
   *
   * RESPUESTA:
   * {
   *   "user": { id, email, name, role, createdAt, updatedAt },
   *   "accessToken": "eyJhbGc..."
   * }
   */
  async register(userObject: RegisterAuthDto) {
    // Genera hash bcrypt de la contraseña
    // 10 rounds: balance entre seguridad y rendimiento (~100ms en máquina moderna)
    const passwordHash = await hash(userObject.password, 10);
    
    // Delega a UsersService que valida y guarda
    const user = await this.usersService.create({
      id: randomUUID(),                    // Genera UUID v4
      email: userObject.email,
      passwordHash,                        // Hash bcrypt, no texto plano
      name: userObject.name,
    });

    return this.buildAuthResponse(user);
  }

  /**
   * LOGIN de usuario existente
   *
   * FLUJO:
   * 1. Recibe DTO con email y password
   * 2. Busca usuario en BD por email
   * 3. Si NO existe: lanza UnauthorizedException (credenciales inválidas)
   * 4. Compara contraseña ingresada con hash almacenado usando bcrypt
   * 5. Si NO coincide: lanza UnauthorizedException (credenciales inválidas)
   * 6. Si coincide: Construye response con usuario + JWT token
   * 7. Retorna al cliente
   *
   * SEGURIDAD:
   * - Usa bcrypt.compare() que es timing-safe (previene timing attacks)
   * - Mensajes de error genéricos (no revela si email existe o password es mal)
   * - JWT token válido solo para el usuario autenticado
   *
   * ERROR HANDLING:
   * - UnauthorizedException: Email no existe O password incorrecto
   *   (mensaje genérico para no revelar información)
   *
   * @param userObject DTO con email, password
   * @returns Promise con { user, accessToken }
   * @throws UnauthorizedException si credenciales son inválidas
   *
   * PAYLOAD ESPERADO:
   * {
   *   "email": "john@example.com",
   *   "password": "securePass123"
   * }
   *
   * RESPUESTA:
   * {
   *   "user": { id, email, name, role, createdAt, updatedAt },
   *   "accessToken": "eyJhbGc..."
   * }
   */
  async login(userObject: LoginAuthDto) {
    // Busca el usuario por email (retorna null si no existe)
    const user = await this.usersService.findByEmail(userObject.email);

    if (!user) {
      // Email no existe - mensaje genérico para seguridad
      throw new UnauthorizedException('Invalid credentials.');
    }

    // Compara contraseña ingresada con hash almacenado
    // compare() es timing-safe y maneja el salt automáticamente
    const isPasswordValid = await compare(userObject.password, user.passwordHash);

    if (!isPasswordValid) {
      // Password incorrecto - mensaje genérico para seguridad
      throw new UnauthorizedException('Invalid credentials.');
    }

    return this.buildAuthResponse(user);
  }

  /**
   * HELPER: Construye respuesta de autenticación
   *
   * RESPONSABILIDAD:
   * - Generar JWT token firmado
   * - Preparar datos públicos del usuario
   * - Combinar en response estándar
   *
   * FLUJO:
   * 1. Extrae datos públicos del usuario (sin passwordHash)
   * 2. Extrae payload para JWT (id, email, role)
   * 3. Firma JWT con secret configurado (exp, aud, iss, etc)
   * 4. Retorna { user, accessToken }
   *
   * JWT TOKEN:
   * - Contiene: sub (user id), email, role, exp (tiempo expiración)
   * - Firmado con JWT_SECRET (configurado en env)
   * - Client lo envía en Authorization: Bearer <token>
   * - Server lo valida en guards (JwtAuthGuard, etc)
   *
   * @param user Entidad User (validada)
   * @returns Promise con { user: públicos, accessToken: JWT firmado }
   */
  private async buildAuthResponse(user: User) {
    return {
      user: user.toPublicJSON(),                           // Sin passwordHash
      accessToken: await this.jwtService.signAsync(
        user.toJwtPayload(),                               // { sub, email, role }
      ),
    };
  }
}
