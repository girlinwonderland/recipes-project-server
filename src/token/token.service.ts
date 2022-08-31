import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUserToken } from './interface/user-token.interface';
import { CreateUserTokenDto } from './dto/create-user-token.dto';

@Injectable()
export class TokenService {
    constructor(@InjectModel('Token') private readonly tokenModel: Model<IUserToken>) {}

    async create(createUserTokenDto: CreateUserTokenDto): Promise<IUserToken>{
        const userToken = new this.tokenModel(createUserTokenDto);
        return await userToken.save();
    }

    async delete(token: string): Promise<any>{
        const tokenData = await this.tokenModel.deleteOne({ token });
        return tokenData;
    }

    async deleteAll(uId: string): Promise<any>{
        await this.tokenModel.deleteMany({ uId });
    }

    async exists(uId: string): Promise<any>{
        await this.tokenModel.exists({ uId })
    }

    async find(uId: any): Promise<any>{
        await this.tokenModel.findOne({ uId })
    }

    async update(uId: any, createUserTokenDto: CreateUserTokenDto): Promise<any>{
        await this.tokenModel.updateOne({ uId }, createUserTokenDto)
    }
}
