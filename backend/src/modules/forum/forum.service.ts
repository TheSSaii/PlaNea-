import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ForumService {
  constructor(private prisma: PrismaService) {}

  // Temas

  // Devuelve todos los temas con sus comentarios
  async getAllTopics() {
    return this.prisma.topic.findMany({
      include: { comments: true },
    });
  }

  // Crea un tema nuevo
  async createTopic(title: string, content: string, author: string, imageUrl?: string) {
  return this.prisma.topic.create({
    data: { title, content, author, imageUrl },
  })
}

  // Devuelve un tema por su ID con sus comentarios
  async getTopicById(id: number) {
    return this.prisma.topic.findUnique({
      where: { id },
      include: { comments: true },
    });
  }

  // Elimina un tema por su ID
  async deleteTopic(id: number): Promise<boolean> {
    const topic = await this.getTopicById(id);

    if (!topic) {
      return false;
    }

    await this.prisma.topic.delete({ where: { id } });
    return true;
  }

  // ── Comentarios ────────────────────────────────────────

  // Agrega un comentario a un tema existente
  async addComment(topicId: number, content: string, author: string) {
    const topic = await this.getTopicById(topicId);

    if (!topic) {
      return null;
    }

    return this.prisma.comment.create({
      data: { content, author, topicId },
    });
  }

  // Eliminar comentario
async deleteComment(topicId: number, commentId: number): Promise<boolean> {
  const comment = await this.prisma.comment.findUnique({ where: { id: commentId } })
  if (!comment || comment.topicId !== topicId) return false
  await this.prisma.comment.delete({ where: { id: commentId } })
  return true
}

  // ---- Dar o quitar like ------------
  async toggleLike(topicId: number, username: string): Promise<{ liked: boolean; count: number }> {
  const existing = await this.prisma.like.findUnique({
    where: { topicId_username: { topicId, username } },
  });

  if (existing) {
    await this.prisma.like.delete({
      where: { topicId_username: { topicId, username } },
    });
  } else {
    await this.prisma.like.create({
      data: { topicId, username },
    });
  }

  const count = await this.prisma.like.count({ where: { topicId } });
  return { liked: !existing, count };
}

// Obtener likes de un topic
async getLikes(topicId: number, username: string) {
  const count = await this.prisma.like.count({ where: { topicId } });
  const liked = await this.prisma.like.findUnique({
    where: { topicId_username: { topicId, username } },
  });
  return { count, liked: !!liked };
}

  // Editar topic
async updateTopic(id: number, data: { title?: string; content?: string }) {
  const topic = await this.getTopicById(id)
  if (!topic) return null
  return this.prisma.topic.update({
    where: { id },
    data: { title: data.title, content: data.content },
  })
}

  // ── Usuarios bloqueados ────────────────────────────────

  // Bloquea un usuario
  async blockUser(username: string): Promise<boolean> {
    const alreadyBlocked = await this.prisma.blockedUser.findUnique({
      where: { username },
    });

    if (alreadyBlocked) {
      return false;
    }

    await this.prisma.blockedUser.create({
      data: { username, blockedAt: new Date() },
    });

    return true;
  }


  // Devuelve la lista de usuarios bloqueados
  async getBlockedUsers() {
    return this.prisma.blockedUser.findMany();
  }

  // Verifica si un usuario está bloqueado
  async isUserBlocked(username: string): Promise<boolean> {
    const blocked = await this.prisma.blockedUser.findUnique({
      where: { username },
    });

    return blocked !== null;
  }

    // Desbloquear usuario
  async unblockUser(username: string): Promise<boolean> {
    const blocked = await this.prisma.blockedUser.findUnique({ where: { username } })
    if (!blocked) return false
    await this.prisma.blockedUser.delete({ where: { username } })
    return true
}
}
