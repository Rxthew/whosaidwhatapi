import request from 'supertest';
import { Response } from 'supertest'
import app from '../../testapp';
import Comment from '../../models/comment'


jest.mock('../../models/comment');

const generateMocks = function(){
    const mockFind = jest.fn();

    return {
        mockFind
    }
};

const { mockFind } = generateMocks();
Comment.find = mockFind;
