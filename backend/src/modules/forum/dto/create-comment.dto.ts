import { IsString, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class CreateCommentDto {
    @IsNotEmpty({ message: 'El comentario no puede estar vacío' })
    @IsString({ message: 'El comentario debe ser texto' })
    @MinLength(2, { message: 'El comentario debe tener mínimo 2 caracteres' })
    content: string;

    // parentId es opcional, se usa para responder a otro comentario
    @IsOptional()
    @IsString()
    parentId?: string;
}