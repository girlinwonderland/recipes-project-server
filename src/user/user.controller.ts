import { Controller, Post, Get, Delete, Put, Param, ValidationPipe, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { CreatePostDto } from './dto/create-post.dto';
import { ObjectId } from 'mongoose';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post('/newPost')
    createPost(@Body() dto: CreatePostDto) {
        return this.userService.createPost(dto);
    }

    @Put('/editPost/:id')
    editPost(@Param('id') id: string, @Body() dto: CreatePostDto) {
        return this.userService.editPost(dto, id);
    }

    @Delete('/deletePost/:id')
    deletePost(@Param('id') id: string){
        return this.userService.deletePost(id);
    }

}
