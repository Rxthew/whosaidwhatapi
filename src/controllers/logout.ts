import { Request, Response, NextFunction } from 'express';
import { redirectToReferringPage, redirectToOrigin } from './helpers/services';

const logout = function(req:Request,res:Response,next:NextFunction){
    req.logout(function(err){
        if(err){
            throw err
        }
    })
    next()

};

export const logoutController = [
    logout,
    redirectToReferringPage,
    redirectToOrigin
]

