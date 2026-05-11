import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service'; // <-- Ojo: Asegúrate de que esta ruta sea la correcta
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
// Importamos el Enum nativo generado por Prisma
import { PlanStatus } from '@prisma/client';

// ⚠️ NOTA IMPORTANTE: En tu nuevo esquema, 'createdById' es un UUID. 
// Cuando vayas a probar creando, esto lanzará un error si 'mock-user-001' no tiene formato UUID
// Te sugiero cambiar esto luego por el ID real del usuario o un UUID de prueba.
const MOCK_USER_ID = '00000000-0000-0000-0000-000000000000';

@Injectable()
export class PlansService {
  constructor(private prisma: PrismaService) {}

  // Adaptamos la lógica para usar el Enum de Prisma (OPEN o FINALIZED)
  private calcStatus(date: Date): PlanStatus {
    return date > new Date() ? PlanStatus.OPEN : PlanStatus.FINALIZED;
  }

  async create(dto: CreatePlanDto | any) {
    // Usamos eventAt en lugar de scheduledAt
    const eventAt = dto.scheduledAt ? new Date(dto.scheduledAt) : undefined;
    
    return this.prisma.plan.create({
      data: {
        createdById: MOCK_USER_ID,                 // Antes userId
        title: dto.name || dto.title,              // Antes name
        peopleCount: dto.numberOfPeople || 1,      // Antes numberOfPeople
        budgetCents: dto.budget || 0,              // Antes budget
        eventAt: eventAt,                          // Antes scheduledAt
        status: eventAt ? this.calcStatus(eventAt) : PlanStatus.OPEN,
        // transport: dto.transport <-- Eliminado porque en tu nuevo esquema es una relación con PlanTransport
      },
      include: { subplans: { orderBy: { order: 'asc' } } },
    });
  }

  async findAll(status?: PlanStatus) {
    return this.prisma.plan.findMany({
      where: {
        createdById: MOCK_USER_ID,
        ...(status ? { status } : {}),
      },
      include: { subplans: { orderBy: { order: 'asc' } } },
      orderBy: { eventAt: 'desc' }, // Antes scheduledAt
    });
  }

  async findOne(id: string) {
    const plan = await this.prisma.plan.findFirst({
      where: { id, createdById: MOCK_USER_ID }, // Antes userId
      include: { subplans: { orderBy: { order: 'asc' } } },
    });
    if (!plan) throw new NotFoundException(`Plan ${id} no encontrado`);
    return plan;
  }

  async update(id: string, dto: UpdatePlanDto | any) {
    await this.findOne(id);
    
    // Mapeamos los datos viejos a los nuevos nombres temporalmente
    const data: any = {};
    if (dto.name) data.title = dto.name;
    if (dto.numberOfPeople) data.peopleCount = dto.numberOfPeople;
    if (dto.budget) data.budgetCents = dto.budget;

    if (dto.scheduledAt) {
      data.eventAt = new Date(dto.scheduledAt);
      data.status = this.calcStatus(data.eventAt);
    }

    return this.prisma.plan.update({
      where: { id },
      data,
      include: { subplans: { orderBy: { order: 'asc' } } },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.plan.delete({ where: { id } });
  }
}