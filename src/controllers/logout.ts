import { Request, Response, NextFunction } from 'express';
import { redirectToReferringPage, redirectToOrigin } from './helpers/services';


//Note: reason I am nullifying the sessionID is because of race conditions in express
//session where the touch method is sometimes invoked after the destroy method thereby
//producing an error. Nullifying the sessionID prevents the touch method from being
//invoked in the first place.

const nullifySessionId = function(req:Request, res:Response, next:NextFunction){
    req.sessionID ? Object.assign(req, {sessionID: null}) : false
    next()
}

const logout = function(req:Request,res:Response,next:NextFunction){
    req.logout(function(err){
        if(err){
            throw err
        }
    })
    next()

};

export const logoutController = [
    nullifySessionId,
    logout,
    redirectToReferringPage,
    redirectToOrigin
]

