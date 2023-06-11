import { Request, Response, NextFunction } from 'express';


export const redirectPage = function(req:Request,res:Response,next:NextFunction){
    const referer = req.get('Referer')
    referer ? res.redirect(referer) : next()
};