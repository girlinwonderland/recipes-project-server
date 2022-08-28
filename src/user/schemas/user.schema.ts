import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema({
    login: { type: String, required: true },
    password: { type: String, required: true },
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }]
})

UserSchema.index({ login: 1 }, { unique: true })
