import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { Result, ValidationError, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import Post from '../../models/post';
import { User } from '../../models/user';

const _basicPostRequestFailed = function(res:Response, errors: Result<ValidationError>){
    const passedErrors = {errors: errors.mapped()}
    res.status(400).json(passedErrors);
    return
};


export const basicValidation = function(req:Request,res:Response,next:NextFunction){
    const errors = validationResult(req)
    const checkEmpty = errors.isEmpty();
    if(checkEmpty){
        next()
        return
    }
    _basicPostRequestFailed(res,errors)
};

export const checkValidityOfPostId = function(id:string | mongoose.Types.ObjectId | unknown){
    const result = mongoose.isObjectIdOrHexString(id);
    if(!result){
        throw new Error('Post\'s object id is invalid.')
    }
    return result    

};

export const checkValidityOfUserId = function(id:string | mongoose.Types.ObjectId | unknown){
    const result = mongoose.isObjectIdOrHexString(id);
    if(!result){
        throw new Error('User\'s object id is invalid.')
    }
    return result

};

export const checkUserIsAuthenticated = function(req:Request, res:Response, next:NextFunction){
    if(req.isAuthenticated()){
        next()
    }
    else{
        res.status(400).json({'errors': {msg: 'User is not authenticated'}})

    }  
};

export const getUser = async function(req:Request, res:Response, next:NextFunction){
    if(Object.prototype.hasOwnProperty.call(req,'isAuthenticated')){
        const user = req.isAuthenticated() ? req.user : false;
        if(user){
            Object.assign(req.body,{user: {username: user.username, member_status: user.member_status, _id: user._id}})
        }
        next()
    }
    else{
        res.json({err: {msg: 'Could not authenticate user.'}})
    }
};

export const generateDate = function(){  //To refine
    return Date.now(); 
};

export const hashPassword = async function(password: string){
    try{
        const result = await bcrypt.hash(password,10);
        return result
    }catch(error){
        throw error
    }

};

export const noDuplicateUsernames = async function(username:string){
    try {
        const user = await User.findOne({
            username: username
        });
        return user ? Promise.reject('This username already exists. Try another one.') : Promise.resolve()
    }
    catch(error){
        throw error
    } 
};

export const postExistsInDatabase = async function(id:string | mongoose.Types.ObjectId | unknown){
    const result = await Post.exists({'_id': id}).catch((err:Error)=>{throw err});
    if(!result){
        throw new Error('Post object id is not in database')
    }
    return result

}

export const redirectToReferringPage = function(req:Request,res:Response,next:NextFunction){
    const referer = req.get('Referer')
    if(referer){
        res.redirect(referer);
        return
    }
    next();
};

export const redirectToOrigin = function(req:Request,res:Response, next:NextFunction){
    const origin = req.get('Origin');
    if(origin){
        res.redirect(origin)
        return
    }
    next()
    
};

export const returnIndexData = function(req:Request, res:Response, next:NextFunction){
    const responseBody = {posts: req.body.posts};
    req.body.user ? Object.assign(responseBody, {user: req.body.user}) : false;
    res.json(responseBody);
};

export const userExistsInDatabase = async function(id:string | mongoose.Types.ObjectId | unknown){
    const result = await User.exists({'_id': id}).catch((err:Error)=>{throw err});
    if(!result){
        throw new Error('User object id is not in database')
    }
    return result

};

