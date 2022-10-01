import * as mongoose from 'mongoose';

export const PostSchema = new mongoose.Schema({
    id: String,
    userId: String,
    title: String,
    description: String,
    user: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    favourite: Boolean
})

PostSchema.index({ id: 1 }, { unique: true })
