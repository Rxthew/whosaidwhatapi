import { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import mongoose from 'mongoose';
import { Comment } from '../models/comment';
import { Post } from '../models/post';
import { basicValidation, checkUserIsAuthenticated, checkValidityOfPostId, checkValidityOfUserId, generateDate, postExistsInDatabase, redirectToOrigin, userExistsInDatabase } from './helpers/services';

const _cascadeDeletePostComments = async function(postId: mongoose.ObjectId | string, session: mongoose.mongo.ClientSession){
    await Comment.deleteMany({post: postId}, {session}).catch((err:Error)=> {throw err})
};


const checkUserIsAdmin = function(req:Request, res:Response, next:NextFunction){
    const memberStatus = req.user?.member_status;
    const isAdmin = memberStatus === 'admin';
    return isAdmin ? next() : res.status(400).json({'errors': {msg: 'User member status does not have the necessary privilege for this request'}})
};

const createPost = async function(req:Request, res:Response, next:NextFunction){
    const db = mongoose.connection;
    try{
        await db.transaction(async function finalisePostCreate(session){
            await Post.create([{
                title: req.body.title,
                content: req.body.content,
                published_status: req.body.published_status || false, 
                user: new mongoose.Types.ObjectId(req.body.user.trim()), 
                date: generateDate()}], {session})
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

const checkPostOwnership = async function(req:Request, res:Response, next:NextFunction){

    const userId = req.user?._id 
    const postId = req.body._id;
    const post = await Post.findById({_id: postId}).catch((error:Error)=>{throw error});
    const notTheOwner = post?.user.toString() !== userId?.toString();
    return notTheOwner ? res.status(400).json({'errors': {msg: 'User is not the owner of this post so this operation is not allowed'}}) : next() 

};

const confirmPostCreated = function(req:Request, res:Response, next: NextFunction){
    res.json({status: 'Post created successfully.' })
};

const confirmPostDeleted = function(req:Request, res:Response, next: NextFunction){
    res.json({status: 'Post deleted successfully.' })
};

const confirmPostUpdated = function(req:Request, res:Response, next: NextFunction){
    res.json({status: 'Post updated successfully.' })
};

const deletePost = async function(req:Request, res:Response, next:NextFunction){
    const db = mongoose.connection;
    try{
        await db.transaction(async function finalisePostDelete(session){
            
            await _cascadeDeletePostComments(req.body._id, session)
            .catch(
                (err:Error)=> {throw err}
                );

            await Post.deleteOne({
                _id: req.body._id
                },
                {session})
            .catch(
                (err:Error)=> {throw err}
                );

        }).catch(
            (err:Error)=> {throw err}
            )
    }catch(err){
        console.log(err)
        res.json({err: err})
    }
    next()
};

const postValidation = basicValidation;

const updatePost = async function(req:Request, res:Response, next:NextFunction){
    const db = mongoose.connection;
    try{
        await db.transaction(async function finalisePostUpdate(session){
            await Post.updateOne({
                _id: req.body._id
                },
                {
                title: req.body.title,
                content: req.body.content,
                published_status: req.body.published_status || false, 
                user: new mongoose.Types.ObjectId(req.body.user.trim()), 
                date: generateDate()
            }, {session})
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


export const deletePostController = [
    checkUserIsAuthenticated,
    checkUserIsAdmin,
    body('_id','Post id must not be empty.')
    .exists()
    .trim()
    .notEmpty()
    .withMessage('Post id must not be empty.')
    .escape(),
    body('_id').custom(checkValidityOfPostId),
    body('_id').custom(postExistsInDatabase),
    postValidation,
    checkPostOwnership,
    deletePost,
    redirectToOrigin,
    confirmPostDeleted
];


export const postPostController = [
    checkUserIsAuthenticated,
    checkUserIsAdmin,
    body('content','Content must not be empty.')
    .exists()
    .trim()
    .notEmpty()
    .withMessage('Content must not be empty.')
    .escape(),
    body('title','Title must not be empty.')
    .exists()
    .trim()
    .notEmpty()
    .withMessage('Title must not be empty.')
    .escape(),
    body('user','User id must not be empty.')
    .exists()
    .trim()
    .notEmpty()
    .withMessage('User id must not be empty.')
    .escape(),
    body('user').custom(checkValidityOfUserId),
    body('user').custom(userExistsInDatabase),
    postValidation,
    createPost,
    redirectToOrigin,
    confirmPostCreated
];


export const putPostController = [
    checkUserIsAuthenticated,
    checkUserIsAdmin,
    body('content','Content must not be empty.')
    .exists()
    .trim()
    .notEmpty()
    .withMessage('Content must not be empty.')
    .escape(),
    body('title','Title must not be empty.')
    .exists()
    .trim()
    .notEmpty()
    .withMessage('Title must not be empty.')
    .escape(),
    body('_id','Post id must not be empty.')
    .exists()
    .trim()
    .notEmpty()
    .withMessage('Post id must not be empty.')
    .escape(),
    body('user','User id must not be empty.')
    .exists()
    .trim()
    .notEmpty()
    .withMessage('User id must not be empty.')
    .escape(),
    body('_id').custom(checkValidityOfPostId),
    body('user').custom(checkValidityOfUserId),
    body('_id').custom(postExistsInDatabase),
    body('user').custom(userExistsInDatabase),
    postValidation,
    checkPostOwnership,
    updatePost,
    redirectToOrigin,
    confirmPostUpdated
];


