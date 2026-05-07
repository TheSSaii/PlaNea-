import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

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