import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// TODO: Archivo temporal creado para que el backend compile.
// El compañero encargado del módulo de auth debe completar
// este servicio con la configuración real de JWT y la app.

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get auth() {
    return {
      jwtSecret: this.configService.get<string>('JWT_SECRET') ?? 'secret',
      jwtExpiresIn: this.configService.get<string>('JWT_EXPIRES_IN') ?? '1d',
    };
  }
}