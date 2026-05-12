import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ForumService {
  constructor(private prisma: PrismaService) {}

  // ── Temas ──────────────────────────────────────────────

  async getAllTopics() {
    return this.prisma.forumTopic.findMany({
      where: { status: 'ACTIVE' },
      include: {
        comments: {
          where: { parentId: null },
          include: { author: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'asc' },
        },
        author: { select: { id: true, name: true } },
        likes: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createTopic(title: string, content: string, guestAuthor: string, imageUrl?: string) {
    return this.prisma.forumTopic.create({
      data: {
        title,
        content,
        imageUrl,
        // Usamos un User "guest" temporal — el authorId lo manejamos
        // con un usuario invitado fijo hasta que haya auth real
        author: {
          connectOrCreate: {
            where: { email: `${guestAuthor.toLowerCase().replace(/\s+/g, '.')}@guest.local` },
            create: {
              email: `${guestAuthor.toLowerCase().replace(/\s+/g, '.')}@guest.local`,
              passwordHash: 'guest',
              name: guestAuthor,
            },
          },
        },
      },
      include: {
        comments: true,
        author: { select: { id: true, name: true } },
        likes: true,
      },
    });
  }

  async getTopicById(id: string) {
    return this.prisma.forumTopic.findUnique({
      where: { id },
      include: {
        comments: {
          where: { parentId: null },
          include: { author: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'asc' },
        },
        author: { select: { id: true, name: true } },
        likes: true,
      },
    });
  }

  async deleteTopic(id: string): Promise<boolean> {
    const topic = await this.prisma.forumTopic.findUnique({ where: { id } });
    if (!topic) return false;
    await this.prisma.forumTopic.delete({ where: { id } });
    return true;
  }

  async updateTopic(id: string, data: { title?: string; content?: string }): Promise<boolean> {
    const topic = await this.prisma.forumTopic.findUnique({ where: { id } });
    if (!topic) return false;
    await this.prisma.forumTopic.update({
      where: { id },
      data: { title: data.title, content: data.content },
    });
    return true;
  }

  // ── Comentarios ────────────────────────────────────────

  async addComment(topicId: string, content: string, guestAuthor: string) {
    const topic = await this.prisma.forumTopic.findUnique({ where: { id: topicId } });
    if (!topic) return null;

    return this.prisma.forumComment.create({
      data: {
        content,
        topic: { connect: { id: topicId } },
        author: {
          connectOrCreate: {
            where: { email: `${guestAuthor.toLowerCase().replace(/\s+/g, '.')}@guest.local` },
            create: {
              email: `${guestAuthor.toLowerCase().replace(/\s+/g, '.')}@guest.local`,
              passwordHash: 'guest',
              name: guestAuthor,
            },
          },
        },
      },
      include: { author: { select: { id: true, name: true } } },
    });
  }

  async deleteComment(topicId: string, commentId: string): Promise<boolean> {
    const comment = await this.prisma.forumComment.findUnique({ where: { id: commentId } });
    if (!comment || comment.topicId !== topicId) return false;
    await this.prisma.forumComment.delete({ where: { id: commentId } });
    return true;
  }

  // ── Likes ──────────────────────────────────────────────

  async toggleLike(topicId: string, username: string): Promise<{ liked: boolean; count: number }> {
    const existing = await this.prisma.forumLike.findUnique({
      where: { topicId_username: { topicId, username } },
    });

    if (existing) {
      await this.prisma.forumLike.delete({
        where: { topicId_username: { topicId, username } },
      });
    } else {
      await this.prisma.forumLike.create({
        data: { topicId, username },
      });
    }

    const count = await this.prisma.forumLike.count({ where: { topicId } });
    return { liked: !existing, count };
  }

  async getLikes(topicId: string, username: string) {
    const count = await this.prisma.forumLike.count({ where: { topicId } });
    const liked = await this.prisma.forumLike.findUnique({
      where: { topicId_username: { topicId, username } },
    });
    return { count, liked: !!liked };
  }

  // ── Usuarios bloqueados ────────────────────────────────

  async blockUser(username: string): Promise<boolean> {
    const already = await this.prisma.forumBlockedUser.findUnique({ where: { username } });
    if (already) return false;
    await this.prisma.forumBlockedUser.create({
      data: { username },
    });
    return true;
  }

  async unblockUser(username: string): Promise<boolean> {
    const blocked = await this.prisma.forumBlockedUser.findUnique({ where: { username } });
    if (!blocked) return false;
    await this.prisma.forumBlockedUser.delete({ where: { username } });
    return true;
  }

  async getBlockedUsers() {
    return this.prisma.forumBlockedUser.findMany();
  }

  async isUserBlocked(username: string): Promise<boolean> {
    const blocked = await this.prisma.forumBlockedUser.findUnique({ where: { username } });
    return blocked !== null;
  }
}
