import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSubplanDto } from './dto/create-subplan.dto';

@Injectable()
export class SubplansService {
  constructor(private prisma: PrismaService) {}

  async addSubplan(planId: string, dto: CreateSubplanDto) {
    return this.prisma.subplan.create({
      data: { ...dto, planId },
    });
  }

  async reorder(planId: string, orderedIds: string[]) {
    await Promise.all(
      orderedIds.map((id, index) =>
        this.prisma.subplan.update({
          where: { id },
          data: { order: index },
        }),
      ),
    );
    return this.prisma.subplan.findMany({
      where: { planId },
      orderBy: { order: 'asc' },
    });
  }

  async remove(planId: string, subplanId: string) {
    const subplan = await this.prisma.subplan.findFirst({
      where: { id: subplanId, planId },
    });
    if (!subplan) throw new NotFoundException('Subplan no encontrado');
    await this.prisma.subplan.delete({ where: { id: subplanId } });
  }
}