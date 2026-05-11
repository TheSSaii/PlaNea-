import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query
} from '@nestjs/common';
import { PlanStatus } from '@prisma/client';
import { PlansService } from './plans.service';
import { SubplansService } from './subplans.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { CreateSubplanDto } from './dto/create-subplan.dto';

@Controller('plans')
export class PlansController {
  constructor(
    private readonly plansService: PlansService,
    private readonly subplansService: SubplansService,
  ) {}

  @Post()
  create(@Body() dto: CreatePlanDto) {
    return this.plansService.create(dto);
  }

  @Get()
  findAll(@Query('status') status?: PlanStatus) {
    return this.plansService.findAll(status);
  }
  
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.plansService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePlanDto) {
    return this.plansService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.plansService.remove(id);
  }

  @Post(':id/subplans')
  addSubplan(@Param('id') planId: string, @Body() dto: CreateSubplanDto) {
    return this.subplansService.addSubplan(planId, dto);
  }

  @Patch(':id/subplans/reorder')
  reorder(
    @Param('id') planId: string,
    @Body() body: { orderedIds: string[] },
  ) {
    return this.subplansService.reorder(planId, body.orderedIds);
  }

  @Delete(':id/subplans/:subplanId')
  removeSubplan(
    @Param('id') planId: string,
    @Param('subplanId') subplanId: string,
  ) {
    return this.subplansService.remove(planId, subplanId);
  }
}