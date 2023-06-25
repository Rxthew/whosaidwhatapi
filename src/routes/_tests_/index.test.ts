import request from 'supertest';
import app, { toggleAuthTestVariable } from '../../testapp';
import { Post } from '../../models/post';

jest.mock('../../models/post');

const generateMocks = function(){
    const mockFind = jest.fn(() => {
        return {
            populate: (obj: Record<string, any>) => {
                return { 
                    exec: () => {return {
                        comment_author: obj.select.user ? 'visible' : 'anonymous'
                    }}
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

describe('index call should return user and visible users for comments where authenticated, else just posts with comments', () => {

    it('Authenticated: Expect dummy user object in response body"', (done) => {
        toggleAuthTestVariable(true);

        request(app)
        .get('/')
        .set('Accept', 'application/json')
        .expect(200)
        .end(async (err,res) => {
            if(err){return await done(err)}
            expect(res.body).toHaveProperty('user.username', 'Jane Doe')
            expect(res.body).toHaveProperty('user.member_status', 'privileged')
            expect(res.body).toHaveProperty('user._id', '200')
            await done()
        })
    });

    it('Authenticated: Expect user (for comments) to be selected as part of query', (done) => {
        toggleAuthTestVariable(true);

        request(app)
        .get('/')
        .set('Accept', 'application/json')
        .expect(200)
        .end(async (err,res) => {
            if(err){return await done(err)}
            expect(res.body).toHaveProperty('posts.comment_author', 'visible')
            await done()
        })
        
    });

    it('Not authenticated: Expect dummy user object to be absent from response body', (done) => {
        toggleAuthTestVariable(false);

        request(app)
        .get('/')
        .set('Accept', 'application/json')
        .expect(200)
        .end(async (err,res) => {
            if(err){return await done(err)}
            expect(res.body).not.toHaveProperty('user')
            await done()
        })
    });

    it('Not authenticated: Expect user (for comments) not to be selected as part of query', (done) => {
        toggleAuthTestVariable(false);

        request(app)
        .get('/')
        .set('Accept', 'application/json')
        .expect(200)
        .end(async (err,res) => {
            if(err){return await done(err)}
            expect(res.body).toHaveProperty('posts.comment_author', 'anonymous')
            await done()
        })
    });
    
})


