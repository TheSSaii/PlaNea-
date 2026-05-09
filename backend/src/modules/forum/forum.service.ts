import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

const MOCK_USER_ID = 'mock-user-001';

@Injectable()
export class ForumService {
    constructor(private prisma: PrismaService) {}

    // ----- Temas -----------------------------------------------

    // Devuelve todos los temas activos con sus comentarios
    async getAllTopics() {
        return this.prisma.forumTopic.findMany({
            where: { status: 'ACTIVE' },
            include: { comments: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    // Crea un tema nuevo
    async createTopic(title: string, content: string) {
        return this.prisma.forumTopic.create({
            data: {
                title,
                content,
                authorId: MOCK_USER_ID,
            },
        });
    }

    // Devuelve un tema por su ID con sus comentarios
    async getTopicById(id: string) {
        const topic = await this.prisma.forumTopic.findUnique({
            where: { id },
            include: { comments: true },
        });

        if (!topic) throw new NotFoundException(`Tema ${id} no encontrado`);
        return topic;
    }

    // Admin bloquea un tema
    async blockTopic(id: string) {
        await this.getTopicById(id);
        return this.prisma.forumTopic.update({
            where: { id },
            data: { status: 'BLOCKED' },
        });
    }

    // Admin elimina un tema
    async deleteTopic(id: string) {
        await this.getTopicById(id);
        await this.prisma.forumTopic.delete({ where: { id } });
    }

    // ----- Comentarios: -------------------

    // Agrega un comentario a un tema
    async addComment(topicId: string, content: string, parentId?: string) {
        await this.getTopicById(topicId);

        return this.prisma.forumComment.create({
            data: {
                content,
                topicId,
                authorId: MOCK_USER_ID,
                ...(parentId ? { parentId } : {}),
            },
        });
    }

    // Admin elimina un comentario
    async deleteComment(commentId: string) {
        const comment = await this.prisma.forumComment.findUnique({
            where: { id: commentId },
        });

        if (!comment) throw new NotFoundException(`Comentario ${commentId} no encontrado`);
        await this.prisma.forumComment.delete({ where: { id: commentId } });
    }
}