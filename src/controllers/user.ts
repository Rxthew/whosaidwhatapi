import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from "express";
import { body, param } from 'express-validator';
import mongoose from "mongoose";
import { User } from "../models/user";
import { basicValidation,  checkValidityOfUserId, hashPassword, noDuplicateUsernames, redirectToOrigin, userExistsInDatabase } from "./helpers/services";


const _getCurrentPassword = async function(id:mongoose.Types.ObjectId | string){ 
    const user = await User.findById(id).catch((err:Error)=>{throw err});
    return user?.password
};


const _confirmPasswordInputs = function(req:Request){
    const newPassword = req.body.new_password.trim();
    const currentPassword = req.body.current_password.trim();
    return newPassword && currentPassword
};


const checkCurrentPassword = async function(req:Request, res:Response, next:NextFunction){
    const inputsArePresent = _confirmPasswordInputs(req) ? true : false;
    if(!inputsArePresent){
        next()
        return
    } 
    const id = req.params['id'];
    const nominalCurrentPassword = await hashPassword(req.body.current_password);
    const realCurrentPassword = await _getCurrentPassword(id);
    const comparisonResult = realCurrentPassword ? await bcrypt.compare(nominalCurrentPassword, realCurrentPassword) : false;
    if(comparisonResult){
        next()
        return
    }
    res.status(400).json({'errors': {msg:'Current password is incorrect. Please try again.'}})
    

};


const assignNewPassword = async function(req:Request, res:Response, next:NextFunction){
    const inputsArePresent = _confirmPasswordInputs(req) ? true : false;
    if(!inputsArePresent){
        next()
        return
    }
    const rawNewPassword = req.body.new_password.trim();
    const newPassword = rawNewPassword.length > 0 ? await hashPassword(req.body.new_password) : false;
    newPassword ? Object.assign(req.body, {password: newPassword}) : false
    next();

};

const confirmDelete = function(req:Request, res:Response, next: NextFunction){
    res.json({status: 'User deleted successfully.' })
};


const confirmUpdate = function(req:Request, res:Response, next: NextFunction){
    res.json({status: 'User updated successfully.' })
};

const deleteUser = async function(req:Request,res:Response,next:NextFunction){
    try{
        const db = mongoose.connection;

        await db.transaction(async function finaliseDeleteUser(session){
            await User.deleteOne({
                _id: req.params['id']
            },
            {session}
            )
            .catch((err:Error)=> {throw err});
        })
        .catch((err:Error)=> {throw err})
        
    } catch(err){
        console.log(err)
        res.json({err: err})
    }
    next()

};

const establishUpdateBody = function(req:Request ,res:Response, next:NextFunction){

    const _checkUpdateBodyLength = function(updateBody: Record<string,string>){
        const length = Object.keys(updateBody);
        return length ? true : false;

    };
    
    const updateBody = {};
   
    const userProperties = [
        'first_name',
        'last_name',
        'username',
        'password',
        'member_status',
    ];

    const parseProperty = function(property:string){
        property in req.body ? Object.assign(updateBody,{[property]: req.body[property]}) : false

    };

    userProperties.map(parseProperty);

    _checkUpdateBodyLength(updateBody) ? Object.assign(req.body, {update: updateBody}) : res.status(400).json({'errors': {msg: 'Update fields are either empty or invalid. Please try again'}})
    next()

};


const reassignMembership = function(req:Request, res: Response, next:NextFunction){

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
        return req.body.regular ? Object.assign(req.body, {member_status: 'regular'}) : false

    };


    adminMember() ?? privilegedMember() ?? regularMember()
    next()
};


const updateUser = async function(req:Request,res:Response,next:NextFunction){
    try{
        const db = mongoose.connection;

        await db.transaction(async function finaliseUpdateUser(session){
            await User.updateOne({_id: req.params['id']},{

                ...req.body.update

            },{session})
            .catch((err:Error)=> {throw err});
        })
        .catch((err:Error)=> {throw err})
        
    } catch(err){
        console.log(err)
        res.json({err: err})
    }
    next()

};

const deleteUserValidation = basicValidation;
const updateUserValidation = basicValidation;

export const deleteUserController = [
    param('id', '_id must not be empty')
    .trim()
    .notEmpty()
    .withMessage('_id must not be empty.')
    .escape(),
    param('id').custom(checkValidityOfUserId),
    deleteUserValidation,
    deleteUser,
    redirectToOrigin,
    confirmDelete


];


export const putUserController = [
    param('id', '_id must not be empty')
    .trim()
    .notEmpty()
    .withMessage('_id must not be empty.')
    .escape(),
    param('id').custom(checkValidityOfUserId),
    param('id').custom(userExistsInDatabase),
    body('first_name')
    .optional({checkFalsy:true})
    .trim()
    .isAlpha()
    .withMessage('Characters in this field must be from the alphabet.')
    .escape(),
    body('last_name')
    .optional({checkFalsy:true})
    .trim()
    .isAlpha(undefined,{ignore: ' -'})
    .withMessage('Characters in this field must be from the alphabet or a hyphen.')
    .escape(),
    body('username', 'username must not be empty')
    .trim()
    .escape(),
    body('username')
    .optional({checkFalsy: true})
    .custom(noDuplicateUsernames),
    body('new_password')
    .optional({checkFalsy: true})
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
    updateUserValidation,
    checkCurrentPassword,
    assignNewPassword,
    reassignMembership,
    establishUpdateBody,
    updateUser,
    redirectToOrigin,
    confirmUpdate
]


