import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
    @ApiProperty()
    @IsNotEmpty()
    readonly login: string;
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    readonly password: string;
}
