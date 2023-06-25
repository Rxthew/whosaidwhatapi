import request from 'supertest';
import { Response } from 'supertest'
import app, { toggleAuthTestVariable } from '../../testapp';
import { Post } from '../../models/post';

jest.mock('../../models/post');

const generateMocks = function(){

    const mockFind = jest.fn().mockImplementation(() => {
        return {
            populate: (obj: Record<string, any>) => {
                return { 
                    exec: () => {return {}}
                }
            },
        }
    });
    

    return {
        mockFind
    }
};


const { mockFind } = generateMocks();

Post.find = mockFind;

const checkIfErrorsPresent = function(res:Response){
    if(!('errors' in res.body)){throw new Error('Errors object not present')}
};

describe('admin route should return posts and user, if user is authenticated and user is admin', () => {

    it('If user is not authenticated, deny access', (done) => {
        toggleAuthTestVariable(false, 'admin')

        request(app)
        .get('/admin')
        .set('Accept', 'application/json')
        .expect(checkIfErrorsPresent)
        .expect(400)
        .end(async (err,res) => {
            if(err){return await done(err)}
            expect(mockFind).not.toHaveBeenCalled()
            await done()
        })   
    })

    it('If user is not admin, deny access', (done) => {
        toggleAuthTestVariable(true, 'privileged')

        request(app)
        .get('/admin')
        .set('Accept', 'application/json')
        .expect(checkIfErrorsPresent)
        .expect(400)
        .end(async (err,res) => {
            if(err){return await done(err)}
            expect(mockFind).not.toHaveBeenCalled()
            await done()
        })

    })

    it('If user is credentialed, return posts and user', (done) => {
        toggleAuthTestVariable(true, 'admin')

        request(app)
        .get('/admin')
        .set('Accept', 'application/json')
        .expect(200)
        .end(async (err,res) => {
            if(err){return await done(err)}
            expect(mockFind).toHaveBeenCalled()
            expect(res.body).toHaveProperty('user.username', 'Jane Doe')
            expect(res.body).toHaveProperty('user.member_status', 'admin')
            expect(res.body).toHaveProperty('user._id', '200')
            await done()
        })

    })

})



