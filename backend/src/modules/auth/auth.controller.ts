/**
 * CONTROLLER LAYER: AuthController
 *
 * Expone endpoints HTTP para autenticación (login y registro)
 * No contiene lógica de negocio, solo orquesta llamadas a servicio
 *
 * RUTA BASE: /auth
 * RESPONSABILIDADES:
 * - Mapear rutas HTTP a métodos
 * - Validar DTOs de entrada (email, password, name)
 * - Llamar al servicio con datos validados
 * - Retornar tokens y datos de usuario
 *
 * FLUJO:
 * HTTP Request → Validación (DTOs) → Controller → AuthService → UsersService → BD
 */

import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';

/**
 * CONTROLADOR: AuthController
 * @Controller('auth') - Prefijo de ruta: /auth
 */
@Controller('auth')
export class AuthController {
  /**
   * Inyección de dependencias
   * NestJS instancia automáticamente AuthService y lo inyecta
   */
  constructor(private readonly authService: AuthService) {}

  /**
   * ENDPOINT: POST /auth/register
   *
   * Registra un nuevo usuario en el sistema
   *
   * FLUJO:
   * 1. Body valida contra RegisterAuthDto (class-validator)
   * 2. Llama authService.register() que:
   *    - Hash bcrypt de contraseña (10 rounds)
   *    - Crea usuario en BD (valida email único)
   *    - Genera JWT token
   * 3. Retorna { user, accessToken }
   *
   * VALIDACIONES (RegisterAuthDto):
   * - email: formato válido @IsEmail()
   * - password: 4-12 caracteres @MinLength(4) @MaxLength(12)
   * - name: 2-80 caracteres, requerido @MinLength(2) @MaxLength(80)
   *
   * Si validación falla: 400 Bad Request con detalles
   *
   * ERRORES ESPERADOS:
   * - 400 Bad Request: Datos inválidos según DTO
   * - 409 Conflict: Email ya registrado (ConflictException)
   *
   * @param userObject DTO validado con email, password, name
   * @returns { user: datos públicos, accessToken: JWT }
   *
   * PAYLOAD ESPERADO:
   * {
   *   "email": "john@example.com",
   *   "password": "mySecurePass123",
   *   "name": "John Doe"
   * }
   *
   * RESPUESTA 201:
   * {
   *   "user": {
   *     "id": "550e8400-e29b-41d4-a716-446655440000",
   *     "email": "john@example.com",
   *     "name": "John Doe",
   *     "role": "user",
   *     "createdAt": "2026-04-29T10:00:00Z",
   *     "updatedAt": "2026-04-29T10:00:00Z"
   *   },
   *   "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   * }
   */
  @Post('register')
  registerUser(@Body() userObject: RegisterAuthDto) {
    return this.authService.register(userObject);
  }

  /**
   * ENDPOINT: POST /auth/login
   *
   * Autentica un usuario existente
   *
   * FLUJO:
   * 1. Body valida contra LoginAuthDto (class-validator)
   * 2. Llama authService.login() que:
   *    - Busca usuario por email en BD
   *    - Compara contraseña con bcrypt.compare() (timing-safe)
   *    - Si válida: genera JWT token
   *    - Si inválida: lanza UnauthorizedException
   * 3. Retorna { user, accessToken }
   *
   * VALIDACIONES (LoginAuthDto):
   * - email: formato válido @IsEmail()
   * - password: 4-12 caracteres @MinLength(4) @MaxLength(12)
   *
   * Si validación falla: 400 Bad Request con detalles
   *
   * ERRORES ESPERADOS:
   * - 400 Bad Request: Datos inválidos según DTO
   * - 401 Unauthorized: Email no existe o password incorrecto
   *   (mismo mensaje genérico por seguridad)
   *
   * @param userObjectLogin DTO validado con email, password
   * @returns { user: datos públicos, accessToken: JWT }
   *
   * PAYLOAD ESPERADO:
   * {
   *   "email": "john@example.com",
   *   "password": "mySecurePass123"
   * }
   *
   * RESPUESTA 200:
   * {
   *   "user": {
   *     "id": "550e8400-e29b-41d4-a716-446655440000",
   *     "email": "john@example.com",
   *     "name": "John Doe",
   *     "role": "user",
   *     "createdAt": "2026-04-29T10:00:00Z",
   *     "updatedAt": "2026-04-29T10:00:00Z"
   *   },
   *   "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   * }
   *
   * FLUJO DE CLIENTE DESPUÉS:
   * 1. Almacena accessToken (sessionStorage, localStorage)
   * 2. Envía en requests futuros: Authorization: Bearer <token>
   * 3. Servidor valida token con JwtAuthGuard (si aplica)
   */
  @Post('login')
  loginUser(@Body() userObjectLogin: LoginAuthDto) {
    return this.authService.login(userObjectLogin);
  }
}
