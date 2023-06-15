import { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import mongoose from 'mongoose';
import  Comment  from '../models/comment';
import Post from '../models/post';
import { User } from '../models/user';
import { basicValidation, redirectPage } from './helpers/services';

const Types = mongoose.Types;


const _checkUserIsAuthenticated = function(req:Request, res:Response, next:NextFunction){
    if(req.isAuthenticated()){
        next()
    }
    else{
        res.status(400).json({'errors': {msg: 'User is not authenticated'}})

    }  
};

const _checkValidityOfCommentId = function(id:string | mongoose.Types.ObjectId | unknown){
    const result = mongoose.isObjectIdOrHexString(id);
    if(!result){
        throw new Error('Comment\'s object id is invalid.')
    }
    return result

};

const _checkValidityOfPostId = function(id:string | mongoose.Types.ObjectId | unknown){
    const result = mongoose.isObjectIdOrHexString(id);
    if(!result){
        throw new Error('Post\'s object id is invalid.')
    }
    return result    

};

const _checkValidityOfUserId = function(id:string | mongoose.Types.ObjectId | unknown){
    const result = mongoose.isObjectIdOrHexString(id);
    if(!result){
        throw new Error('User\'s object id is invalid.')
    }
    return result

};

const _generateDate = function(){  //To refine
    return Date.now(); 
};


const _commentExistsInDatabase = async function(id:string | mongoose.Types.ObjectId | unknown){
    const result = await Comment.exists({'_id': id}).catch((err:Error)=>{throw err});
    if(!result){
        throw new Error('Comment object id is not in database')
    }
    return result
};

const _postExistsInDatabase = async function(id:string | mongoose.Types.ObjectId | unknown){
    const result = await Post.exists({'_id': id}).catch((err:Error)=>{throw err});
    if(!result){
        throw new Error('Post object id is not in database')
    }
    return result


};

const _userExistsInDatabase = async function(id:string | mongoose.Types.ObjectId | unknown){
    const result = await User.exists({'_id': id}).catch((err:Error)=>{throw err});
    if(!result){
        throw new Error('User object id is not in database')
    }
    return result

};


const commentValidation = basicValidation;

const confirmCommentCreated = function(req:Request, res:Response, next: NextFunction){
    res.json({status: 'Comment created successfully.' })
};

const confirmCommentDeleted = function(req:Request, res:Response, next: NextFunction){
    res.json({status: 'Comment deleted successfully.' })
};

const confirmCommentUpdated = function(req:Request, res:Response, next: NextFunction){
    res.json({status: 'Comment updated successfully.' })
};

const createComment = async function(req:Request, res:Response, next:NextFunction){
    const db = mongoose.connection;
    try{
        await db.transaction(async function finaliseCommentCreate(session){
            await Comment.create([{
                content: req.body.content,
                post: new Types.ObjectId(req.body.post.trim()), 
                user: new Types.ObjectId(req.body.user.trim()), 
                date: _generateDate()}], {session})
            .catch(
                (err:Error)=> {throw err}
                )

        }).catch(
            (err:Error)=> {throw err}
            )
    }catch(err){
        console.log(err)
        res.json({err: err})
    }
    next()
};

const deleteComment = async function(req:Request, res:Response, next:NextFunction){
    const db = mongoose.connection;
    try{
        await db.transaction(async function finaliseCommentDelete(session){
            await Comment.deleteOne({
                _id: req.body._id
                },
                {session})
            .catch(
                (err:Error)=> {throw err}
                )

        }).catch(
            (err:Error)=> {throw err}
            )
    }catch(err){
        console.log(err)
        res.json({err: err})
    }
    next()
};

const updateComment = async function(req:Request, res:Response, next:NextFunction){
    const db = mongoose.connection;
    try{
        await db.transaction(async function finaliseCommentUpdate(session){
            await Comment.updateOne({
                _id: req.body._id
                },
                [{
                content: req.body.content,
                post: new Types.ObjectId(req.body.post.trim()), 
                user: new Types.ObjectId(req.body.user.trim()), 
                date: _generateDate()}], {session})
            .catch(
                (err:Error)=> {throw err}
                )

        }).catch(
            (err:Error)=> {throw err}
            )
    }catch(err){
        console.log(err)
        res.json({err: err})
    }
    next()
};

export const deleteCommentController = [
    _checkUserIsAuthenticated,
    body('_id','Comment id must not be empty.')
    .trim()
    .notEmpty()
    .withMessage('Comment id must not be empty.')
    .escape(),
    body('_id').custom(_checkValidityOfCommentId),
    commentValidation,
    deleteComment,
    redirectPage,
    confirmCommentDeleted
]


export const postCommentController = [
    _checkUserIsAuthenticated,
    body('content','Content must not be empty.')
    .trim()
    .notEmpty()
    .withMessage('Content must not be empty.')
    .escape(),
    body('post','Post id must not be empty.')
    .trim()
    .notEmpty()
    .withMessage('Post id must not be empty.')
    .escape(),
    body('user','User id must not be empty.')
    .trim()
    .notEmpty()
    .withMessage('User id must not be empty.')
    .escape(),
    body('post').custom(_checkValidityOfPostId),
    body('user').custom(_checkValidityOfUserId),
    body('post').custom(_postExistsInDatabase),
    body('user').custom(_userExistsInDatabase),
    commentValidation,
    createComment,
    redirectPage,
    confirmCommentCreated
];

export const putCommentController = [
    _checkUserIsAuthenticated,
    body('content','Content must not be empty.')
    .trim()
    .notEmpty()
    .withMessage('Content must not be empty.')
    .escape(),
    body('_id','Comment id must not be empty.')
    .trim()
    .notEmpty()
    .withMessage('Comment id must not be empty.')
    .escape(),
    body('post','Post id must not be empty.')
    .trim()
    .notEmpty()
    .withMessage('Post id must not be empty.')
    .escape(),
    body('user','User id must not be empty.')
    .trim()
    .notEmpty()
    .withMessage('User id must not be empty.')
    .escape(),
    body('_id').custom(_checkValidityOfCommentId),
    body('post').custom(_checkValidityOfPostId),
    body('user').custom(_checkValidityOfUserId),
    body('_id').custom(_commentExistsInDatabase),
    body('post').custom(_postExistsInDatabase),
    body('user').custom(_userExistsInDatabase),
    commentValidation,
    updateComment,
    redirectPage,
    confirmCommentUpdated
];



