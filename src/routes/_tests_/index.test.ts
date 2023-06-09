import {Request, Response as ExpressResponse, NextFunction} from 'express';
import request from 'supertest';
import { Response } from 'supertest'
import app from '../../testapp';
import Comment from '../../models/comment'


jest.mock('../../models/comment');


const authTestSetup = function(){
    const _authTestVariable = {authenticated: true};
    
    const toggleAuthTestVariable = function(){
        const newStatus = _authTestVariable.authenticated ? _authTestVariable.authenticated = false : _authTestVariable.authenticated = true;
        return _authTestVariable.authenticated
    }
    const isAuthenticated = function(req:Request, res: ExpressResponse, next:NextFunction){
        const isAuth = function(){return _authTestVariable.authenticated};
        Object.assign(req, {isAuthenticated: isAuth});
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
    const mockFind = jest.fn();

    return {
        mockFind
    }
};

const { mockFind } = generateMocks();
Comment.find = mockFind;

