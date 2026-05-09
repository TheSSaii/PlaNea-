import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { ForumService } from './forum.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { AdminActionDto } from './dto/admin-action.dto';

@Controller('forum')
export class ForumController {
    constructor(private readonly forumService: ForumService) {}

    // GET /forum/topics → devuelve todos los temas activos
    @Get('topics')
    getAllTopics() {
        return this.forumService.getAllTopics();
    }

    // POST /forum/topics → crea un tema nuevo
    @Post('topics')
    createTopic(@Body() body: CreateTopicDto) {
        return this.forumService.createTopic(body.title, body.content);
    }

    // GET /forum/topics/:id → devuelve un tema por su ID
    @Get('topics/:id')
    getTopicById(@Param('id') id: string) {
        return this.forumService.getTopicById(id);
    }

    // DELETE /forum/topics/:id → admin elimina un tema
    @Delete('topics/:id')
    deleteTopic(@Param('id') id: string, @Body() body: AdminActionDto) {
        if (!body.isAdmin) {
            return { message: 'Solo el administrador puede eliminar temas' };
        }
        return this.forumService.deleteTopic(id);
    }

    // POST /forum/topics/:id/block → admin bloquea un tema
    @Post('topics/:id/block')
    blockTopic(@Param('id') id: string, @Body() body: AdminActionDto) {
        if (!body.isAdmin) {
            return { message: 'Solo el administrador puede bloquear temas' };
        }
        return this.forumService.blockTopic(id);
    }

    // POST /forum/topics/:id/comments → agrega un comentario a un tema
    @Post('topics/:id/comments')
    addComment(@Param('id') id: string, @Body() body: CreateCommentDto) {
        return this.forumService.addComment(id, body.content, body.parentId);
    }

    // DELETE /forum/comments/:id → admin elimina un comentario
    @Delete('comments/:id')
    deleteComment(@Param('id') id: string, @Body() body: AdminActionDto) {
        if (!body.isAdmin) {
            return { message: 'Solo el administrador puede eliminar comentarios' };
        }
        return this.forumService.deleteComment(id);
    }
}