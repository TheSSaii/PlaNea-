import {
  Controller, Get, Post, Delete, Patch,
  Param, Body, Query,
  UseInterceptors, UploadedFile
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ForumService } from './forum.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { AdminActionDto } from './dto/admin-action.dto';

@Controller('forum')
export class ForumController {
  constructor(private readonly forumService: ForumService) {}

  @Get('topics')
  async getAllTopics() {
    return this.forumService.getAllTopics();
  }

  @Post('topics')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads',
      filename: (_req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
        cb(null, unique + extname(file.originalname))
      },
    }),
    fileFilter: (_req, file, cb) => {
      const allowed = /\.(jpg|jpeg|png|gif|webp)$/i
      cb(null, allowed.test(file.originalname))
    },
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  }))
  async createTopic(
    @Body() body: CreateTopicDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const blocked = await this.forumService.isUserBlocked(body.author)
    if (blocked) {
      return { message: `El usuario ${body.author} está bloqueado y no puede crear temas` }
    }

    const imageUrl = file ? `/uploads/${file.filename}` : undefined
    return this.forumService.createTopic(body.title, body.content, body.author, imageUrl)
  }

  @Get('topics/:id')
  async getTopicById(@Param('id') id: string) {
    const topic = await this.forumService.getTopicById(Number(id))
    if (!topic) return { message: 'Tema no encontrado' }
    return topic
  }

  @Delete('topics/:id')
  async deleteTopic(@Param('id') id: string, @Body() body: AdminActionDto) {
    if (!body.isAdmin) return { message: 'Solo el administrador puede eliminar temas' }
    const deleted = await this.forumService.deleteTopic(Number(id))
    if (!deleted) return { message: 'Tema no encontrado' }
    return { message: 'Tema eliminado correctamente' }
  }

  @Post('topics/:id/comments')
  async addComment(@Param('id') id: string, @Body() body: CreateCommentDto) {
    const blocked = await this.forumService.isUserBlocked(body.author)
    if (blocked) {
      return { message: `El usuario ${body.author} está bloqueado y no puede comentar` }
    }
    const comment = await this.forumService.addComment(Number(id), body.content, body.author)
    if (!comment) return { message: 'Tema no encontrado, no se pudo comentar' }
    return comment
  }

  @Post('users/block')
  async blockUser(@Body() body: AdminActionDto & { username: string }) {
    if (!body.isAdmin) return { message: 'Solo el administrador puede bloquear usuarios' }
    const blocked = await this.forumService.blockUser(body.username)
    if (!blocked) return { message: `El usuario ${body.username} ya estaba bloqueado` }
    return { message: `El usuario ${body.username} fue bloqueado correctamente` }
  }

  @Get('users/blocked')
  async getBlockedUsers() {
    return this.forumService.getBlockedUsers()
  }

  @Post('topics/:id/like')
  async toggleLike(@Param('id') id: string, @Body() body: { username: string }) {
    return this.forumService.toggleLike(Number(id), body.username)
  }

  @Get('topics/:id/likes')
  async getLikes(@Param('id') id: string, @Query('username') username: string) {
    return this.forumService.getLikes(Number(id), username)
  }

  @Delete('users/block/:username')
  async unblockUser(
    @Param('username') username: string,
    @Body() body: AdminActionDto,
  ) {
  if (!body.isAdmin) return { message: 'Solo el administrador puede desbloquear usuarios' }
    const unblocked = await this.forumService.unblockUser(username)
  if (!unblocked) return { message: `El usuario ${username} no estaba bloqueado` }
    return { message: `El usuario ${username} fue desbloqueado correctamente` }
}

  @Patch('topics/:id')
  async updateTopic(
    @Param('id') id: string,
    @Body() body: { title?: string; content?: string; author: string },
  ) {
  const updated = await this.forumService.updateTopic(Number(id), body)
  if (!updated) return { message: 'Tema no encontrado' }
    return updated
}

@Delete('topics/:topicId/comments/:commentId')
async deleteComment(
    @Param('topicId') topicId: string,
    @Param('commentId') commentId: string,
    @Body() body: AdminActionDto,
) {
  if (!body.isAdmin) return { message: 'Solo el administrador puede eliminar comentarios' }
  const deleted = await this.forumService.deleteComment(Number(topicId), Number(commentId))
  if (!deleted) return { message: 'Comentario no encontrado' }
  return { message: 'Comentario eliminado correctamente' }
}
}