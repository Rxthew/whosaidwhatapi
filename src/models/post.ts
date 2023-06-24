import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const PostSchema = new Schema({
    content: {type: String,required: true},
    date: {type: Date,required: true},
    published_status: {type: Boolean, required: true},
    title: {type: String,required: true},
    user: {type: Schema.Types.ObjectId, ref:'User', required: true},
},
{
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
}) 

PostSchema.virtual('comments',{
    ref: 'Comment',
    localField: '_id',
    foreignField: 'post'
} )

export default mongoose.model('Post', PostSchema);
