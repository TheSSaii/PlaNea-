import { IsBoolean, IsNotEmpty } from 'class-validator';

export class AdminActionDto {
    @IsBoolean({ message: 'isAdmin debe ser verdadero o falso' })
    @IsNotEmpty({ message: 'isAdmin no puede estar vacío' })
    isAdmin: boolean;
}