import { Request, Response, NextFunction } from 'express';
import { Result, ValidationError, validationResult } from 'express-validator';

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

export const redirectPage = function(req:Request,res:Response,next:NextFunction){
    const referer = req.get('Referer')
    referer ? res.redirect(referer) : next()
};