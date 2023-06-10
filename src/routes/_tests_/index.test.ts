import {Request, Response as ExpressResponse, NextFunction} from 'express';
import request from 'supertest';
import { Response } from 'supertest'
import app from '../../testapp';
import Post from '../../models/post';

jest.mock('../../models/post');


const authTestSetup = function(){
    const _authTestVariable = {authenticated: true};
    
    const toggleAuthTestVariable = function(){
        const newStatus = _authTestVariable.authenticated ? _authTestVariable.authenticated = false : _authTestVariable.authenticated = true;
        return _authTestVariable.authenticated
    };


    const isAuthenticated = function(req:Request, res: ExpressResponse, next:NextFunction){
        const isAuth = function(){return _authTestVariable.authenticated};
        Object.assign(req, {isAuthenticated: isAuth});
        Object.assign(req, { user: {username: 'Jane Doe', member_status: 'regular'} })
        next();
    };

    return {
        isAuthenticated,
        toggleAuthTestVariable
        
    }

}

const {isAuthenticated, toggleAuthTestVariable} = authTestSetup();
app.use(isAuthenticated);

const generateMocks = function(){
    const mockFind = jest.fn(() => {
        return {
            populate: (obj: Record<string, any>) => {
                return { 
                    exec: () => obj.select.user
                }
            },
        }
    })

    return {
        mockFind
    }
};

const { mockFind } = generateMocks();

(Post as Record<'find',any>).find = mockFind;



