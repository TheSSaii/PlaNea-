/**
 * CONTROLLER LAYER: UsersController
 *
 * Expone endpoints HTTP para operaciones relacionadas con usuarios
 * No contiene lógica de negocio, solo orquesta llamadas a servicio
 *
 * RUTA BASE: /users
 * RESPONSABILIDADES:
 * - Mapear rutas HTTP a métodos
 * - Validar DTOs de entrada
 * - Llamar al servicio con datos validados
 * - Serializar respuestas HTTP
 *
 * FLUJO:
 * HTTP Request → Validación (DTOs) → Controller → Service → Repository → BD
 */

import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

/**
 * CONTROLADOR: UsersController
 * @Controller('users') - Prefijo de ruta: /users
 */
@Controller('users')
export class UsersController {
  /**
   * Inyección de dependencias
   * NestJS instancia automáticamente UsersService y lo inyecta
   */
  constructor(private readonly usersService: UsersService) {}

  /**
   * ENDPOINT: GET /users/:id
   *
   * Obtiene datos públicos de un usuario por su ID
   *
   * FLUJO:
   * 1. Route param valida y extrae el ID
   * 2. Llama al servicio para buscar usuario
   * 3. Convierte a JSON público (sin passwordHash)
   * 4. Retorna respuesta 200
   *
   * ERRORES ESPERADOS:
   * - 404 Not Found: Si el usuario no existe (NotFoundException del servicio)
   *
   * @param id ID del usuario (UUID)
   * @returns Usuario con propiedades públicas (sin passwordHash)
   *
   * RESPUESTA EJEMPLO:
   * {
   *   "id": "550e8400-e29b-41d4-a716-446655440000",
   *   "email": "user@example.com",
   *   "name": "John Doe",
   *   "role": "user",
   *   "createdAt": "2026-04-29T10:00:00Z",
   *   "updatedAt": "2026-04-29T10:00:00Z"
   * }
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    return user.toPublicJSON();
  }

  /**
   * ENDPOINT: PATCH /users/:id
   *
   * Actualiza el perfil de un usuario
   *
   * FLUJO:
   * 1. Route param valida y extrae el ID
   * 2. Body valida contra UpdateUserDto (class-validator)
   * 3. Llama al servicio para actualizar
   * 4. Convierte a JSON público
   * 5. Retorna respuesta 200 con usuario actualizado
   *
   * VALIDACIONES (UpdateUserDto):
   * - Cada campo tiene decoradores @Is... (min length, max length, etc)
   * - Si validación falla: 400 Bad Request con detalles de error
   *
   * ERRORES ESPERADOS:
   * - 400 Bad Request: Datos inválidos según UpdateUserDto
   * - 404 Not Found: Si el usuario no existe
   *
   * @param id ID del usuario a actualizar
   * @param body Datos a actualizar (UpdateUserDto)
   * @returns Usuario actualizado con propiedades públicas
   *
   * PAYLOAD EJEMPLO:
   * {
   *   "name": "Jane Doe"
   * }
   *
   * RESPUESTA: Usuario actualizado con novo updateProfile
   */
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateUserDto) {
    const user = await this.usersService.updateProfile(id, body);
    return user.toPublicJSON();
  }
}
