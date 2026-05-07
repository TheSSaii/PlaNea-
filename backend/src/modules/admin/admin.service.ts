import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; // OJO: Si te da error esta ruta, pon '../prisma/prisma.service'

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    // Adaptamos las estadísticas a los nuevos estados reales de tu BD
    const [total, draft, open, finalized, canceled, byUser] = await Promise.all([
      this.prisma.plan.count(),
      this.prisma.plan.count({ where: { status: 'DRAFT' } }),
      this.prisma.plan.count({ where: { status: 'OPEN' } }),
      this.prisma.plan.count({ where: { status: 'FINALIZED' } }),
      this.prisma.plan.count({ where: { status: 'CANCELED' } }),
      this.prisma.plan.groupBy({ by: ['createdById'], _count: true }),
    ]);
    return { total, draft, open, finalized, canceled, uniqueUsers: byUser.length };
  }

  async findAllPlans() {
    return this.prisma.plan.findMany({
      // ADVERTENCIA: Si en tu nuevo esquema borraste la tabla 'Subplan', 
      // esto te va a dar error. Tendrías que cambiarlo por 'stops' o como se llame ahora.
      include: { stops: { orderBy: { position: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOnePlan(id: string) {
    const plan = await this.prisma.plan.findUnique({
      where: { id },
      include: { stops: { orderBy: { position: 'asc' } } },
    });
    if (!plan) throw new NotFoundException(`Plan ${id} no encontrado`);
    return plan;
  }

  async updatePlan(id: string, data: any) {
    await this.findOnePlan(id);
    
    // Si envían una fecha, ajustamos el estado con los nuevos nombres
    if (data.scheduledAt) {
      data.scheduledAt = new Date(data.scheduledAt);
      data.status = data.scheduledAt > new Date() ? 'OPEN' : 'FINALIZED';
    }

    return this.prisma.plan.update({
      where: { id },
      data,
      include: { stops: { orderBy: { position: 'asc' } } },
    });
  }

  async deletePlan(id: string) {
    await this.findOnePlan(id);
    await this.prisma.plan.delete({ where: { id } });
    return { message: 'Plan eliminado correctamente' };
  }
}