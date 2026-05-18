import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * PrismaModule — Módulo global de base de datos.
 *
 * Al marcarse como @Global(), PrismaService queda disponible
 * en todos los módulos de la aplicación sin necesidad de
 * importarlo explícitamente en cada uno.
 *
 * IMPORTANTE PARA EL EQUIPO:
 * Si su módulo necesita usar PrismaService, tienen dos opciones:
 *
 * Opción A (recomendada) — Importar PrismaModule en su módulo:
 *   imports: [PrismaModule]
 *
 * Opción B — Agregar PrismaService directamente en providers:
 *   providers: [SuService, PrismaService]
 *
 * El archivo prisma.service.ts ya existe en esta misma carpeta
 * y maneja la conexión/desconexión automática con PostgreSQL.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}