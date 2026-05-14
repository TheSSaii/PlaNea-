import { Module } from '@nestjs/common';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

import { USERS_REPOSITORY } from './users.repository';

import { PrismaUsersRepository } from './infrastructure/prisma-users.repository';

// opcional para desarrollo/testing
// import { InMemoryUsersRepository } from './repositories/in-memory-users.repository';

@Module({
  controllers: [UsersController],

  providers: [
    UsersService,

    {
      provide: USERS_REPOSITORY,

      useClass: PrismaUsersRepository,

      // para testing:
      // useClass: InMemoryUsersRepository,
    },
  ],

  exports: [UsersService],
})
export class UsersModule {}