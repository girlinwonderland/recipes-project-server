import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as _ from 'lodash';
import { IUser } from './interface/user.interface';
import { IPost } from './interface/post.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { ObjectId } from 'mongoose';

@Injectable()
export class UserService {
    private readonly saltRounds = 10;

    constructor(@InjectModel('User') private readonly userModel: Model<IUser>,
                @InjectModel('Post') private readonly postModel: Model<IPost>) {}

    async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(this.saltRounds);
        return await bcrypt.hash(password, salt);
    }

    async create(createUserDto: CreateUserDto): Promise<IUser> {
        const hash = await this.hashPassword(createUserDto.password);
        const createdUser = new this.userModel(_.assignIn(createUserDto, { password: hash }));
        return await createdUser.save();
    }

    async findByLogin(login: string): Promise<IUser> {
        return await this.userModel.findOne({ login }).populate('posts').exec();
    }

    async find(id: string): Promise<IUser> {
        return await this.userModel.findById(id).populate('posts').exec();
    }

    async update(_id: string, payload: Partial<IUser>) {
        return await this.userModel.updateOne({ _id }, payload);
    }

    async createPost(dto: CreatePostDto): Promise<IPost> {
        const user = await this.userModel.findById(dto.userId);
        const post = await this.postModel.create({ ...dto });
        user.posts.push(post._id);
        await user.save();
        return post;
    }

    async editPost(dto: CreatePostDto, id: string): Promise<boolean>{
        await this.postModel.updateOne({ id }, { ...dto });
        return true
    }

    async deletePost(id: string): Promise<boolean> {
        await this.postModel.findByIdAndDelete(id);
        return true;
    }
}
