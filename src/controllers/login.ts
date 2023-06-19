import { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import passport from 'passport';
import { basicValidation, redirectToOrigin, redirectToReferringPage } from './helpers/services';



const authenticateUser = function(req:Request, res:Response, next:NextFunction){
    const referer = req.get('Referer')
    return referer ? passport.authenticate('local', {failureRedirect: referer, failureMessage: true})(req,res,next) : passport.authenticate('local')(req,res,next)
    
};

const confirmLogin = function(req:Request, res:Response, next: NextFunction){
    res.json({status: 'Login successful.' })
};

const loginValidation = basicValidation;

const supplyUserInfo = function(req:Request, res:Response, next:NextFunction){
    if(req.user){
        const user = Object.assign(req.user, {password: ''});
        res.json(user)
    }
    next()
};


const loginController = [
    body('username', 'username must not be empty')
    .trim()
    .escape(),
    body('password','Password must not be empty')
    .trim()
    .isLength({min: 8})
    .withMessage('password needs to be a minimum of 8 characters')
    .escape(),
    loginValidation,
    authenticateUser,
    supplyUserInfo,
    redirectToReferringPage,
    redirectToOrigin, 
    confirmLogin
];

export default loginController