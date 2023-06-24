import mongoose from 'mongoose';
import request, { Response } from 'supertest';
import  Comment  from '../../models/comment';
import Post from '../../models/post';
import { User } from '../../models/user';
import app, { toggleAuthTestVariable } from '../../testapp';


jest.mock('../../models/comment');
jest.mock('../../models/post');
jest.mock('../../models/user');

jest.mock('mongoose', () => {
    const actualModule = jest.requireActual('mongoose');
    return {
        __esModule: true,
        default: {
            ...actualModule,
            connection: {transaction: (write:() => Promise<void> | Error) => {
               return Promise.resolve(write())
               
            }}
        }
        
    }
});

const generateMocks = function(){
    const mockDeleteOne = jest.fn().mockImplementation(()=>{
        return Promise.resolve(true)
    })
    const mockDeleteMany = jest.fn().mockImplementation(()=>{
        return Promise.resolve(true)
    })
    const mockFindById = jest.fn().mockImplementation(() =>{
        return Promise.resolve(true)
    })
    const mockFindOne = jest.fn();

    const mockPostExists = jest.fn().mockImplementation(()=> {
        return Promise.resolve(true)
    });

    const mockUpdateOne = jest.fn().mockImplementation(() =>{
        return Promise.resolve()
    })
    const mockUserExists = jest.fn().mockImplementation(
        ()=> Promise.resolve(true));

    return {
        
        mockDeleteOne,
        mockDeleteMany,
        mockFindById,
        mockFindOne,
        mockPostExists,
        mockUpdateOne,
        mockUserExists

    }
};