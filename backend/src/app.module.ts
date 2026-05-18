import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import * as Joi from 'joi';
import { ForumModule } from './modules/forum/forum.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PlansModule } from './modules/plans/plans.module';
import { AdminModule } from './modules/admin/admin.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().min(32).required(),
        PORT: Joi.number().default(3000),
        NODE_ENV: Joi.string()
            .valid('development', 'production', 'test')
            .default('development'),
      }),
    }),
    PrismaModule,
    ForumModule,
    AuthModule,
    UsersModule,
    PlansModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
