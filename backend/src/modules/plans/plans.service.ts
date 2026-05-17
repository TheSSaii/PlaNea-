import { Injectable, NotFoundException } from '@nestjs/common';
import { PlanStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class PlansService {
  constructor(private prisma: PrismaService) {}

  private calcStatus(date: Date): PlanStatus {
    return date > new Date() ? PlanStatus.OPEN : PlanStatus.FINALIZED;
  }

  private async getCreatedById(createdById?: string) {
    if (createdById) return createdById;

    const user = await this.prisma.user.upsert({
      where: { email: 'dev@queplan.local' },
      update: {},
      create: {
        email: 'dev@queplan.local',
        passwordHash: 'development-only-user',
        name: 'Usuario Desarrollo',
      },
      select: { id: true },
    });

    return user.id;
  }

  async create(dto: CreatePlanDto) {
    const createdById = await this.getCreatedById(dto.createdById);

    return this.prisma.plan.create({
      data: {
        title: dto.title,
        description: dto.description,
        peopleCount: dto.peopleCount,
        budgetCents: dto.budgetCents,
        eventAt: dto.eventAt ? new Date(dto.eventAt) : undefined,
        createdBy: {
          connect: { id: createdById },
        },
      },
      include: { subplans: { orderBy: { order: 'asc' } } },
    });
  }

  async findAll(status?: string) {
    const whereClause =
      status && Object.values(PlanStatus).includes(status as PlanStatus)
        ? { status: status as PlanStatus }
        : {};

    return this.prisma.plan.findMany({
      where: whereClause,
      orderBy: { eventAt: 'desc' },
      include: { subplans: { orderBy: { order: 'asc' } } },
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
    await this.findOne(id);

    const data: {
      title?: string;
      description?: string;
      peopleCount?: number;
      budgetCents?: number;
      eventAt?: Date;
      status?: PlanStatus;
      createdBy?: { connect: { id: string } };
    } = {};

    if (dto.title != null) data.title = dto.title;
    if (dto.description != null) data.description = dto.description;
    if (dto.peopleCount != null) data.peopleCount = Number(dto.peopleCount);
    if (dto.budgetCents != null) data.budgetCents = Number(dto.budgetCents);
    if (dto.createdById) {
      data.createdBy = { connect: { id: await this.getCreatedById(dto.createdById) } };
    }

    const requestedStatus = (dto as UpdatePlanDto & { status?: PlanStatus }).status;
    if (requestedStatus && Object.values(PlanStatus).includes(requestedStatus)) {
      data.status = requestedStatus;
    }

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
    await this.findOne(id);
    await this.prisma.plan.delete({ where: { id } });
  }
}
