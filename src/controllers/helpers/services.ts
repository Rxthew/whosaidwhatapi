import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { Result, ValidationError, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import { User } from '../../models/user';

const _basicPostRequestFailed = function(res:Response, errors: Result<ValidationError>){
    const passedErrors = {errors: errors.mapped()}
    res.status(400).json(passedErrors);
    return
};

export const basicValidation = function(req:Request,res:Response,next:NextFunction){
    const errors = validationResult(req)
    const checkEmpty = errors.isEmpty();
    checkEmpty ? next() : _basicPostRequestFailed(res,errors)
};

export const checkValidityOfUserId = function(id:string | mongoose.Types.ObjectId | unknown){
    const result = mongoose.isObjectIdOrHexString(id);
    if(!result){
        throw new Error('User\'s object id is invalid.')
    }
    return result

};

export const hashPassword = async function(password: string){
    try{
        const result = await bcrypt.hash(password,10);
        return result
    }catch(error){
        throw error
    }

};

export const redirectPage = function(req:Request,res:Response,next:NextFunction){
    const referer = req.get('Referer')
    referer ? res.redirect(referer) : next()
};


export const userExistsInDatabase = async function(id:string | mongoose.Types.ObjectId | unknown){
    const result = await User.exists({'_id': id}).catch((err:Error)=>{throw err});
    if(!result){
        throw new Error('User object id is not in database')
    }
    return result

};

