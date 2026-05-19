import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ForumService {
  constructor(private prisma: PrismaService) {}

  private readonly fallbackPasswordHash =
    '$2b$10$7YvS2S2z6QeHG5A7pPScduw1nGG05f5jWbK5gBcZAw5XnbXgq8m7K';

  private normalizeGuestEmail(name: string) {
    const safeName = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '.')
      .replace(/^\.+|\.+$/g, '') || 'anonimo';

    return `${safeName}@guest.local`;
  }

  private async getAuthorConnect(authorName: string, authorId?: string) {
    if (authorId) {
      const user = await this.prisma.user.findUnique({
        where: { id: authorId },
        select: { id: true },
      });

      if (user) return { connect: { id: user.id } };
    }

    const email = this.normalizeGuestEmail(authorName);

    return {
      connectOrCreate: {
        where: { email },
        create: {
          email,
          passwordHash: this.fallbackPasswordHash,
          name: authorName,
        },
      },
    };
  }

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

  async createTopic(
    title: string,
    content: string,
    guestAuthor: string,
    imageUrl?: string,
    authorId?: string,
  ) {
    return this.prisma.forumTopic.create({
      data: {
        title,
        content,
        imageUrl,
        author: await this.getAuthorConnect(guestAuthor, authorId),
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

  async addComment(topicId: string, content: string, guestAuthor: string, authorId?: string) {
    const topic = await this.prisma.forumTopic.findUnique({ where: { id: topicId } });
    if (!topic) return null;

    return this.prisma.forumComment.create({
      data: {
        content,
        topic: { connect: { id: topicId } },
        author: await this.getAuthorConnect(guestAuthor, authorId),
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
