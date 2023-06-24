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
    const mockCreate = jest.fn().mockImplementation(()=>{
        return Promise.resolve(true)
    })
    const mockDeleteOne = jest.fn().mockImplementation(()=>{
        return Promise.resolve(true)
    })
    const mockDeleteMany = jest.fn().mockImplementation(()=>{
        return Promise.resolve(true)
    })
    const mockFindById = jest.fn().mockImplementation(() =>{
        return Promise.resolve(true)
    })
    const mockPostExists = jest.fn().mockImplementation(()=> {
        return Promise.resolve(true)
    });

    const mockUpdateOne = jest.fn().mockImplementation(() =>{
        return Promise.resolve()
    })
    const mockUserExists = jest.fn().mockImplementation(
        ()=> Promise.resolve(true));

    return {

        mockCreate,
        mockDeleteOne,
        mockDeleteMany,
        mockFindById,
        mockPostExists,
        mockUpdateOne,
        mockUserExists

    }
};

const addOns = function(){
    
    const checkIfErrorsPresent = function(res:Response){
        if(!('errors' in res.body)){throw new Error('Errors object not present')}
    };

    const mockIdParam = new mongoose.Types.ObjectId().toString();
    const origin = 'http://localhost:3000';
    
    return {
        checkIfErrorsPresent,
        mockIdParam,
        origin,
    }

};


const { mockCreate, mockDeleteOne, mockDeleteMany,  mockFindById, mockPostExists, mockUpdateOne, mockUserExists,} = generateMocks();
const { checkIfErrorsPresent, mockIdParam, origin} = addOns();

Comment.deleteMany = mockDeleteMany;
Post.create = mockCreate;
Post.deleteOne = mockDeleteOne;
Post.exists = mockPostExists;
Post.findById = mockFindById;
Post.updateOne = mockUpdateOne;
User.exists = mockUserExists;


