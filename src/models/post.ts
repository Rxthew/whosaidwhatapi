import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const PostSchema = new Schema({
    content: {type: String,required: true},
    date: {type: Date,required: true},
    published_status: {type: Boolean, required: true},
    title: {type: String,required: true},

}) 

export default mongoose.model('Post', PostSchema);
