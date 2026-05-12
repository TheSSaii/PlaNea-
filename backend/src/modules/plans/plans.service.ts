import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class PlansService {
  constructor(private prisma: PrismaService) {}

  private calcStatus(date: Date) {
    return date > new Date() ? 'FUTURE' : 'PAST';
  }

  async create(dto: CreatePlanDto) {
    return await this.prisma.plan.create({
      data: {
        title: dto.title,
        description: dto.description,
        peopleCount: dto.peopleCount,
        budgetCents: dto.budgetCents,
        // Convertimos el string a Date si viene en el payload
        eventAt: dto.eventAt ? new Date(dto.eventAt) : undefined, 
        // Relación con el usuario:
        createdBy: {
          connect: { id: dto.createdById }
        }
      }
    });
  }

  async findAll(status?: string) {
    // Construimos el filtro dinámicamente. Si mandan status, lo filtramos, si no, trae todo.
    const whereClause = status ? { status: status as any } : {};

    return this.prisma.plan.findMany({
      where: whereClause,
      orderBy: { eventAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const plan = await this.prisma.plan.findUnique({
      where: { id },
      include: { subplans: { orderBy: { order: 'asc' } } },
    });
    
    if (!plan) throw new NotFoundException(`Plan ${id} no encontrado`);
    return plan;
  }

  async update(id: string, dto: UpdatePlanDto) {
    // Verificamos que el plan exista antes de actualizar
    await this.findOne(id);
    
    const data: any = { ...dto };
    if (dto.eventAt) {
      data.eventAt = new Date(dto.eventAt);
      data.status = this.calcStatus(data.eventAt);
    }
    
    return this.prisma.plan.update({
      where: { id },
      data,
      include: { subplans: { orderBy: { order: 'asc' } } },
    });
  }

  async remove(id: string) {
    // Verificamos que el plan exista antes de eliminar
    await this.findOne(id);
    
    await this.prisma.plan.delete({ where: { id } });
  }
}