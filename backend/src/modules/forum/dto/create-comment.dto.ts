import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateCommentDto {
    @IsNotEmpty({ message: 'El comentario no puede estar vacío' })
    @IsString({ message: 'El comentario debe ser texto' })
    @MinLength(2, { message: 'El comentario debe tener mínimo 2 caracteres' })
    content: string;

    @IsNotEmpty({ message: 'El autor no puede estar vacío' })
    @IsString({ message: 'El autor debe ser texto' })
    author: string;
}