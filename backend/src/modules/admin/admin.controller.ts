import { Controller, Get, Patch, Delete, Param, Body } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin/plans')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  getStats() { return this.adminService.getStats(); }

  @Get()
  findAll() { return this.adminService.findAllPlans(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.adminService.findOnePlan(id); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.adminService.updatePlan(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.adminService.deletePlan(id); }
}