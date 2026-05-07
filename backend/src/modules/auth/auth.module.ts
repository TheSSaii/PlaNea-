/**
 * MODULE: AuthModule
 *
 * Agrupa toda la funcionalidad de autenticación
 * - Controllers: ExponeHTTP endpoints (/auth/login, /auth/register)
 * - Services: Lógica de negocio (bcrypt, JWT)
 * - Imports: Dependencias internas (UsersModule, JwtModule) y configuración
 *
 * RESPONSABILIDADES:
 * - Exportar AuthService para que otros módulos lo usen
 * - Configurar JWT con valores del .env
 * - Exponer endpoints de autenticación
 *
 * CONEXIONES CON OTROS MÓDULOS:
 * - Importa UsersModule (para gestionar usuarios)
 * - Importa JwtModule (para generar tokens)
 */

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import type { SignOptions } from 'jsonwebtoken';
import { AppConfigService } from '../../config/app-config.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';

/**
 * CONFIGURACIÓN: AuthModule
 */
@Module({
  /**
   * IMPORTS: Módulos y servicios que este módulo necesita
   *
   * UsersModule:
   * - Proporciona: UsersService (gestión de usuarios en BD)
   * - Razón: AuthService necesita crear/buscar usuarios
   *
   * JwtModule.registerAsync():
   * - Crea JwtService inyectable
   * - registerAsync(): espera a que AppConfigService esté listo
   * - useFactory: función que retorna config de JWT
   *
   * CONFIGURACIÓN JWT (del .env vía AppConfigService):
   * - secret: JWT_SECRET (clave para firmar tokens)
   * - signOptions.expiresIn: JWT_EXPIRES_IN (ej: "1d")
   * - Estos valores vienen de archivo de configuración
   */
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      inject: [AppConfigService],  // Inyecta servicio de configuración
      useFactory: (configService: AppConfigService) => ({
        secret: configService.auth.jwtSecret,
        signOptions: {
          expiresIn: configService.auth.jwtExpiresIn as SignOptions['expiresIn'],
        },
      }),
    }),
  ],

  /**
   * CONTROLLERS: Endpoints HTTP expuestos por este módulo
   * - AuthController: POST /auth/register, POST /auth/login
   */
  controllers: [AuthController],

  /**
   * PROVIDERS: Servicios que viven en este módulo
   * - AuthService: Lógica de autenticación (se inyecta en controller)
   */
  providers: [AuthService],

  /**
   * EXPORTS: Servicios que otros módulos pueden importar
   * - Actualmente NO exporta nada (AuthService es interno)
   * - Si otro módulo necesitara AuthService, iría aquí
   * - Ejemplo: exports: [AuthService]
   */
})
export class AuthModule {}
