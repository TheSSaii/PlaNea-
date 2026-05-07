import { Module } from '@nestjs/common';
import { PlansController } from './plans.controller';
import { PlansService } from './plans.service';
import { SubplansService } from './subplans.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [PlansController],
  providers: [PlansService, SubplansService, PrismaService],
})
export class PlansModule {}