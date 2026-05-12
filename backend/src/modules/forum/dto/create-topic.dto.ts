import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class CreateTopicDto {
    @IsNotEmpty({ message: 'El título no puede estar vacío' })
    @IsString({ message: 'El título debe ser texto' })
    @MinLength(5, { message: 'El título debe tener mínimo 5 caracteres' })
    @MaxLength(100, { message: 'El título no puede tener más de 100 caracteres' })
    title: string;

    @IsNotEmpty({ message: 'El contenido no puede estar vacío' })
    @IsString({ message: 'El contenido debe ser texto' })
    @MinLength(10, { message: 'El contenido debe tener mínimo 10 caracteres' })
    content: string;

    @IsNotEmpty({ message: 'El autor no puede estar vacío' })
    @IsString({ message: 'El autor debe ser texto' })
    author: string;
}