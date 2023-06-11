import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { body, header, Result, ValidationError, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import { User } from '../models/user';





const _hashPassword = async function(password: string){
    try{
        const result = await bcrypt.hash(password,10);
        return result
    }catch(error){
        throw error
    }

};

const _noDuplicateUsernames = async function(username:string){
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

const _signUpFailed = function(res:Response, errors: Result<ValidationError>){
        const passedErrors = {errors: errors.mapped()}
        res.status(400).json(passedErrors);
        return
};

const signUpValidation = function(req:Request,res:Response,next:NextFunction){
    const errors = validationResult(req)
    const checkEmpty = errors.isEmpty();
    if(checkEmpty){
        next()
    }
    else{
        _signUpFailed(res,errors)
    }
};

const assignMembershipCode = function(req:Request, res: Response, next:NextFunction){

    const adminMember = function(){
        if(req.body.admin_code && req.body.admin_code === '4321'){
            return Object.assign(req.body, {member_status: 'admin'})   
        }
        return null
    };

    const privilegedMember = function(){
        if(req.body.privilege_code && req.body.privilege_code === '1234'){
           return Object.assign(req.body, {member_status: 'privileged'})
    
        }
        return null
    };

    const regularMember = function(){
        return Object.assign(req.body, {member_status: 'regular'})

    };


    adminMember() ?? privilegedMember() ?? regularMember()
    next()
};

const saveUser = async function(req:Request,res:Response,next:NextFunction){
    try{
        const db = mongoose.connection;
        const hashed = await _hashPassword(req.body.password)
        const user = new User({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            username: req.body.username,
            password: hashed,
            member_status: req.body.member_status 
        })
        
        await db.transaction(async function finaliseSaveUser(session){
            await user.save({session});
        }).catch((err:Error)=> {throw err})
        
    } catch(err){
        console.log(err)
    }
    next()
};

const redirectPage = function(req:Request,res:Response,next:NextFunction){
    const referer = req.get('Referer')
    if(referer){
        res.redirect(referer);
    }
    else{
        res.json({errors: {
            msg: 'Referer header is not set. Sign-up complete. Please go back to homepage.'
        }})
    }
}

const signUpController = [
    header('Referer').exists()
    .withMessage('Referer header must not be empty.'),
    body('first_name','First name must not be empty.')
    .trim()
    .isAlpha()
    .withMessage('Characters in this field must be from the alphabet.')
    .escape(),
    body('last_name', 'Last name must not be empty')
    .trim()
    .isAlpha(undefined,{ignore: ' -'})
    .withMessage('Characters in this field must be from the alphabet or a hyphen.')
    .escape(),
    body('username', 'username must not be empty')
    .trim()
    .escape(),
    body('username').custom(_noDuplicateUsernames),
    body('password','Password must not be empty')
    .trim()
    .isLength({min: 8})
    .withMessage('password needs to be a minimum of 8 characters')
    .escape(),
    body('privilege_code')
    .optional({checkFalsy:true})
    .trim()
    .equals('1234')
    .withMessage('passcode for privileged status is incorrect')
    .escape(),
    body('admin_code')
    .optional({checkFalsy:true})
    .trim()
    .equals('4321')
    .withMessage('passcode for admin status is incorrect')
    .escape(),
    signUpValidation,
    assignMembershipCode,
    saveUser,
    redirectPage,
];

export default signUpController