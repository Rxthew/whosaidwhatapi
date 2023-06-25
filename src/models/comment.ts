import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const CommentSchema = new Schema({
    content: {type: String,required: true},
    date: {type: Date,required: true},
    post: {type: Schema.Types.ObjectId, ref:'Post', required: true},
    user: {type: Schema.Types.ObjectId, ref:'User', required: true},

}) 

export const Comment = mongoose.model('Comment', CommentSchema);
