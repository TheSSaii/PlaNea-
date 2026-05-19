import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { LoginAuthDto } from './login-auth.dto';


export class RegisterAuthDto extends LoginAuthDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(80)
  name!: string;
}
