import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const UserSchema = new Schema({
    first_name: {type: String,required: true},
    last_name: {type: String,required: true},
    username: {type: String,required: true},
    password: {type: String,required: true},
    member_status: {type: String,required: true},
},
{
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
})

UserSchema.virtual('comments',{
    ref: 'Comment',
    localField: '_id',
    foreignField: 'user'
} )

UserSchema.virtual('posts',{
    ref: 'Post',
    localField: '_id',
    foreignField: 'user'
} )


export const User = mongoose.model('User',UserSchema);
