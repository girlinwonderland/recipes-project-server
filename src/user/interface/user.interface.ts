import { Document } from 'mongoose';

export interface IUser extends Document {
    readonly login: string;
    readonly password: string;
    readonly posts: any[]
}
