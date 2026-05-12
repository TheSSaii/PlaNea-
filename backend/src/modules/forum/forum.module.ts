import { Module } from '@nestjs/common';
import { ForumController } from './forum.controller';
import { ForumService } from './forum.service';
import { PrismaService } from '../prisma.service';

@Module({
    controllers: [ForumController],
    providers: [ForumService, PrismaService],
})
export class ForumModule {}
