import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { ObjectId } from 'mongoose';

export class CreatePostDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    readonly title: string;
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    readonly description: string;
    @IsString()
    @ApiProperty()
    readonly userId: ObjectId;
    @IsString()
    @ApiProperty()
    readonly favourite: boolean
}
