import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import * as Joi from 'joi';
import { ForumModule } from './modules/forum/forum.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().min(32).required(),
        PORT: Joi.number().default(3000),
        NODE_ENV: Joi.string()
            .valid('development', 'production', 'test')
            .default('development'),
      }),
    }),
    ForumModule,
  ],
})
export class AppModule {}