import { IsEmail, MaxLength, MinLength, IsString } from 'class-validator';
export class LoginAuthDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;
}
