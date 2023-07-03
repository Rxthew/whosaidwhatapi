import { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import mongoose from 'mongoose';
import  { Comment }  from '../models/comment';
import { basicValidation, checkValidityOfPostId, checkValidityOfUserId, checkUserIsAuthenticated, 
    generateDate, redirectToOrigin, postExistsInDatabase, userExistsInDatabase } from './helpers/services';

const Types = mongoose.Types;



const _checkValidityOfCommentId = function(id:string | mongoose.Types.ObjectId | unknown){
    const result = mongoose.isObjectIdOrHexString(id);
    const commentError = () => {throw new Error('Comment\'s object id is invalid.')}
    return result || commentError()
};

const _commentExistsInDatabase = async function(id:string | mongoose.Types.ObjectId | unknown){
    const result = await Comment.exists({'_id': id}).catch((err:Error)=>{throw err});
    const commentError = () => {throw new Error('Comment object id is not in database')}
    return result || commentError()
};

const _userIsAdmin = function(status:string | undefined){
    return status === 'admin'

};

const checkUserIsPrivileged = function(req:Request, res:Response, next:NextFunction){
     const memberStatus = req.user?.member_status;
     const isPrivileged = memberStatus === 'privileged' || memberStatus === 'admin';
     isPrivileged ? next() :  res.status(400).json({'errors': {msg: 'User member status does not have the necessary privilege for this request'}})

};

const checkCommentOwnership = async function(req:Request, res:Response, next:NextFunction){

    const parseOwnership = async function(){
        const userId = req.user?._id 
        const commentId = req.body._id;
        const comment = await Comment.findById({_id: commentId}).catch((error:Error)=>{throw error})
        const notTheOwner = comment?.user.toString() !== userId?.toString()
        return notTheOwner ? res.status(400).json({'errors': {msg: 'User is not the owner of this comment so this operation is not allowed'}}) : next()
    }

    const isAdmin = _userIsAdmin(req.user?.member_status)
    return isAdmin ? next() : await parseOwnership()
    
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
                {
                content: req.body.content,
                post: new Types.ObjectId(req.body.post.trim()), 
                user: new Types.ObjectId(req.body.user.trim()), 
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

export const deleteCommentController = [
    checkUserIsAuthenticated,
    checkUserIsPrivileged,
    body('_id','Comment id must not be empty.')
    .exists()
    .trim()
    .notEmpty()
    .withMessage('Comment id must not be empty.')
    .escape(),
    body('_id').custom(_checkValidityOfCommentId),
    body('_id').custom(_commentExistsInDatabase),
    commentValidation,
    checkCommentOwnership,
    deleteComment,
    redirectToOrigin,
    confirmCommentDeleted
]


export const postCommentController = [
    checkUserIsAuthenticated,
    checkUserIsPrivileged,
    body('content','Content must not be empty.')
    .exists()
    .trim()
    .notEmpty()
    .withMessage('Content must not be empty.')
    .escape(),
    body('post','Post id must not be empty.')
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
    body('post').custom(checkValidityOfPostId),
    body('user').custom(checkValidityOfUserId),
    body('post').custom(postExistsInDatabase),
    body('user').custom(userExistsInDatabase),
    commentValidation,
    createComment,
    redirectToOrigin,
    confirmCommentCreated
];

export const putCommentController = [
    checkUserIsAuthenticated,
    checkUserIsPrivileged,
    body('content','Content must not be empty.')
    .exists()
    .trim()
    .notEmpty()
    .withMessage('Content must not be empty.')
    .escape(),
    body('_id','Comment id must not be empty.')
    .exists()
    .trim()
    .notEmpty()
    .withMessage('Comment id must not be empty.')
    .escape(),
    body('post','Post id must not be empty.')
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
    body('_id').custom(_checkValidityOfCommentId),
    body('post').custom(checkValidityOfPostId),
    body('user').custom(checkValidityOfUserId),
    body('_id').custom(_commentExistsInDatabase),
    body('post').custom(postExistsInDatabase),
    body('user').custom(userExistsInDatabase),
    commentValidation,
    checkCommentOwnership,
    updateComment,
    redirectToOrigin,
    confirmCommentUpdated
];



