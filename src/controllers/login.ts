import { Request, Response, NextFunction } from 'express';
import { body, header, Result, ValidationError, validationResult } from 'express-validator';
import passport from 'passport';

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
        const user = req.user;
        res.json(user)
    }
    else if(referer){
        res.redirect(referer)
    }
};

const authenticateUser = function(req:Request, res:Response, next: NextFunction){
    const referer = _supplyReferer(req,res,next);
    passport.authenticate('local', {failureRedirect: referer, failureMessage: true}, _supplyUserInfo)
};
