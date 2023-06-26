import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { Result, ValidationError, validationResult } from 'express-validator';
import { DateTime } from 'luxon'; 
import mongoose from 'mongoose';
import { Post } from '../../models/post';
import { User } from '../../models/user';

const _basicPostRequestFailed = function(res:Response, errors: Result<ValidationError>){
    const passedErrors = {errors: errors.mapped()}
    res.status(400).json(passedErrors);
    return
};


export const basicValidation = function(req:Request,res:Response,next:NextFunction){
    const errors = validationResult(req)
    const checkEmpty = errors.isEmpty();
    checkEmpty ? next() : false;
    return checkEmpty || _basicPostRequestFailed(res, errors)
    
};

export const checkValidityOfPostId = function(id:string | mongoose.Types.ObjectId | unknown){
    const result = mongoose.isObjectIdOrHexString(id);
    const postError = () => {throw new Error('Post\'s object id is invalid.')}
    return result || postError()   

};

export const checkValidityOfUserId = function(id:string | mongoose.Types.ObjectId | unknown){
    const result = mongoose.isObjectIdOrHexString(id);
    const userError = () => {throw new Error('User\'s object id is invalid.')}
    return result || userError()

};

export const checkUserIsAuthenticated = function(req:Request, res:Response, next:NextFunction){
    req.isAuthenticated() ? next() : res.status(400).json({'errors': {msg: 'User is not authenticated'}})  
};

export const getUser = async function(req:Request, res:Response, next:NextFunction){

    try{
        const filterUserData = function(auth:boolean){
            const user = auth ? req.user : false;
            user ? Object.assign(req.body,{user: {username: user.username, member_status: user.member_status, _id: user._id}}) : false 
            next()
            return true
        };

        req.isAuthenticated() ? filterUserData(req.isAuthenticated()) : next()

    }
    catch(error){
        throw error
    }
      
};

export const generateDate = function(){
    return DateTime.utc().toISO();
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
    const postError = () => {throw new Error('Post object id is not in database')}
    return result || postError()

}

export const redirectToReferringPage = function(req:Request,res:Response,next:NextFunction){
    const referer = req.get('Referer')
    return referer ? res.redirect(referer) : next()

};

export const redirectToOrigin = function(req:Request,res:Response, next:NextFunction){
    const origin = req.get('Origin');
    return origin ? res.redirect(origin) : next()
    
};

export const returnIndexData = function(req:Request, res:Response, next:NextFunction){
    const responseBody = {posts: req.body.posts};
    req.body.user ? Object.assign(responseBody, {user: req.body.user}) : false;
    res.json(responseBody);
};

export const userExistsInDatabase = async function(id:string | mongoose.Types.ObjectId | unknown){
    const result = await User.exists({'_id': id}).catch((err:Error)=>{throw err});
    const userError = () => { throw new Error('User object id is not in database')}
    return result || userError()

};

