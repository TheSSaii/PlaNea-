import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

// TODO: Este servicio está pendiente de actualizar al schema actual del proyecto.
// Los campos userId, name, numberOfPeople, budget, transport, scheduledAt
// no existen en el modelo Plan del schema.prisma actual.
/*
const MOCK_USER_ID = 'mock-user-001';

@Injectable()
export class PlansService {
  constructor(private prisma: PrismaService) {}

  private calcStatus(date: Date) {
    return date > new Date() ? 'FUTURE' : 'PAST';
  }

  async create(dto: CreatePlanDto) {

    const scheduledAt = new Date(dto.scheduledAt);
    return this.prisma.plan.create({
      data: {
        userId: MOCK_USER_ID,
        name: dto.name,
        numberOfPeople: dto.numberOfPeople,
        budget: dto.budget,
        transport: dto.transport,
        scheduledAt,
        status: this.calcStatus(scheduledAt),
      },
      include: { subplans: { orderBy: { order: 'asc' } } },
    });
  }

  async findAll(status?: string) {
    return this.prisma.plan.findMany({
      where: {
        userId: MOCK_USER_ID,
        ...(status ? { status: status as any } : {}),
      },
      include: { subplans: { orderBy: { order: 'asc' } } },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const plan = await this.prisma.plan.findFirst({
      where: { id, userId: MOCK_USER_ID },
      include: { subplans: { orderBy: { order: 'asc' } } },
    });
    if (!plan) throw new NotFoundException(`Plan ${id} no encontrado`);
    return plan;
  }

  async update(id: string, dto: UpdatePlanDto) {
    await this.findOne(id);
    const data: any = { ...dto };
    if (dto.scheduledAt) {
      data.scheduledAt = new Date(dto.scheduledAt);
      data.status = this.calcStatus(data.scheduledAt);
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
*/

//Lo agregue solo para hacer pruebas de mi módulo, lo pueden retirar apenas esten realizando sus respectivas modificaciones.
@Injectable()
export class PlansService {
  constructor(private prisma: PrismaService) {}


async create(dto: CreatePlanDto) {
    throw new NotFoundException('Módulo de planes en construcción');
  }

  async findAll(status?: string) {
    return [];
  }

  async findOne(id: string) {
    throw new NotFoundException('Módulo de planes en construcción');
  }

  async update(id: string, dto: UpdatePlanDto) {
    throw new NotFoundException('Módulo de planes en construcción');
  }

  async remove(id: string) {
    throw new NotFoundException('Módulo de planes en construcción');
  }
}
