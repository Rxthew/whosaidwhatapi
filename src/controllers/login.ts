import { Request, Response, NextFunction } from 'express';
import { body, header, Result, ValidationError, validationResult } from 'express-validator';
import passport from 'passport';


const _loginValidationFailed = function(res:Response, errors: Result<ValidationError>){
    const passedErrors = {errors: errors.mapped()}
    res.status(400).json(passedErrors);
    return
};


const _supplyReferer = function(req:Request,res:Response,next:NextFunction){
    const referer = req.get('Referer')
    if(referer){
        return referer
    }
    else{
        res.json({errors: {
            msg: 'Referer header is not set. Sign-up complete. Please go back to homepage.'
        }})
    }
};

const _supplyUserInfo = function(req:Request, res:Response, next:NextFunction){
    const referer = _supplyReferer(req,res,next);
    if(req.user){
        const user = Object.assign(req.user, {password: ''});
        res.json(user)
    }
    else if(referer){
        res.redirect(referer)
    }
};

const authenticateUser = function(req:Request, res:Response, next:NextFunction){
    const redirect = _supplyReferer(req,res,next);
    return passport.authenticate('local', {failureRedirect: redirect, failureMessage: true}, _supplyUserInfo)(req,res,next)
    
};

const loginValidation = function(req:Request,res:Response,next:NextFunction){
    const errors = validationResult(req);
    const checkEmpty = errors.isEmpty();
    if(checkEmpty){
        next()
    }
    else{
        _loginValidationFailed(res,errors)
    }
};

const loginController = [
    header('Referer').exists()
    .withMessage('Referer header must not be empty.'),
    body('username', 'username must not be empty')
    .trim()
    .escape(),
    body('password','Password must not be empty')
    .trim()
    .isLength({min: 8})
    .withMessage('password needs to be a minimum of 8 characters')
    .escape(),
    loginValidation,
    authenticateUser
];

export default loginController