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
                write()
                return {catch: (err:Error) => {err ? console.log(err) : false }}
            }}
        }
        
    }
});


const mockCreate = jest.fn();
const mockDeleteOne = jest.fn();
const mockUpdateOne = jest.fn();
Comment.create = mockCreate.mockImplementation(()=>{
    return Promise.resolve()
});

Comment.deleteOne = mockDeleteOne.mockImplementation(()=>{
    return Promise.resolve()
});

Comment.updateOne = mockUpdateOne.mockImplementation(()=>{
    return Promise.resolve()
});


const mockCommentExists = jest.fn().mockImplementation(()=> Promise.resolve(true));
const mockUserExists = jest.fn().mockImplementation(()=> Promise.resolve(true));
const mockPostExists = jest.fn().mockImplementation(()=> Promise.resolve(true));

Comment.exists = mockCommentExists;
Post.exists = mockPostExists;
User.exists = mockUserExists;



const checkIfErrorsPresent = function(res:Response){
    if(!('errors' in res.body)){throw new Error('Errors object not present')}
};

const databaseMockGenerator = function(modelMockExists: typeof mockPostExists | typeof mockUserExists){
    
    const databaseMockImplementation = function(fakeId: mongoose.Types.ObjectId | null){
        return modelMockExists.mockImplementationOnce(
        function (idContainer:Record<'_id', string | mongoose.Types.ObjectId>){
                if(fakeId){
                    const result = idContainer['_id'] === fakeId.toString()
                    return Promise.resolve(result);
                }
                return fakeId    
            }
        ); 
    
    };

    return databaseMockImplementation
};

 

describe('Comment creation should work if user authenticated and post id and user id are validated', () => {
    
    const postId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    
   

    beforeEach(()=>{
        mockCreate.mockClear()
    })

    it('Comment should not be created if user is not authenticated', (done) => {
        toggleAuthTestVariable(false);

        request(app)
        .post('/comment')
        .set('Accept', 'application/json')
        .send({content: 'test content', post: postId, user: userId})
        .expect(checkIfErrorsPresent)
        .expect(400)
        .end(async (err,res) => {
            if(err){return done(err)}
            expect(mockCreate).not.toHaveBeenCalled()
            done()
        })

    });

    it('Comment should not be created if content is whitespace', (done) => {
        toggleAuthTestVariable(true);

        request(app)
        .post('/comment')
        .set('Accept', 'application/json')
        .send({content: '  ', post: postId, user: userId})
        .expect(checkIfErrorsPresent)
        .expect(400)
        .end(async (err,res) => {
            if(err){return done(err)}
            expect(mockCreate).not.toHaveBeenCalled()
            done()
        })

    });

    it('Comment should not be created if content is empty', (done) => {
        toggleAuthTestVariable(true);

        request(app)
        .post('/comment')
        .set('Accept', 'application/json')
        .send({content: '', post: postId, user: userId})
        .expect(checkIfErrorsPresent)
        .expect(400)
        .end(async (err,res) => {
            if(err){return done(err)}
            expect(mockCreate).not.toHaveBeenCalled()
            done()
        })

    });

    it('Comment should not be created if post id is not in database', (done) => {
        toggleAuthTestVariable(true);
        databaseMockGenerator(mockPostExists)(new mongoose.Types.ObjectId());

        request(app)
        .post('/comment')
        .set('Accept', 'application/json')
        .send({content: 'test content', post: postId, user: userId})
        .expect(checkIfErrorsPresent)
        .expect(400)
        .end(async (err,res) => {
            if(err){return done(err)}
            expect(mockCreate).not.toHaveBeenCalled()
            done()
        })


    })

    it('Comment should not be created if user id is not in database', (done) => {
        toggleAuthTestVariable(true);
        databaseMockGenerator(mockUserExists)(new mongoose.Types.ObjectId());

        request(app)
        .post('/comment')
        .set('Accept', 'application/json')
        .send({content: 'test content', post: postId, user: userId})
        .expect(checkIfErrorsPresent)
        .expect(400)
        .end(async (err,res) => {
            if(err){return done(err)}
            expect(mockCreate).not.toHaveBeenCalled()
            done()
        })

    })

    it('Expect comment creation to redirect to origin if referer header is supplied', (done) => {
        const origin = 'http://127.0.0.1:3000';
        toggleAuthTestVariable(true);
        databaseMockGenerator(mockPostExists)(postId);

        request(app)
        .post('/comment')
        .set('Referer', origin)
        .set('Accept', 'application/json')
        .send({content: 'test content', post: postId, user: userId})
        .expect(302)
        .end(async (err,res) => {
            if(err){return done(err)}
            expect(mockCreate).toHaveBeenCalled()
            done()
        })


    })
    
    it('Expect comment creation to return an object with comment created status if referer header is not present', (done) => {
        toggleAuthTestVariable(true);
        databaseMockGenerator(mockUserExists)(userId);

        request(app)
        .post('/comment')
        .set('Accept', 'application/json')
        .send({content: 'test content', post: postId, user: userId})
        .expect(200)
        .end(async (err,res) => {
            if(err){return done(err)}
            expect(mockCreate).toHaveBeenCalled()
            expect(res.body).toHaveProperty('status', 'Comment created successfully.')
            done()
        })

    })
});

describe('Comment delete should work if user authenticated and _id is validated', () => {
    
    const commentId = new mongoose.Types.ObjectId();
  
    beforeEach(()=>{
        mockDeleteOne.mockClear()
    })

    it('Comment should not be deleted if user is not authenticated', (done) => {
        toggleAuthTestVariable(false);

        request(app)
        .delete('/comment')
        .set('Accept', 'application/json')
        .send({ _id: commentId})
        .expect(checkIfErrorsPresent)
        .expect(400)
        .end(async (err,res) => {
            if(err){return done(err)}
            expect(mockDeleteOne).not.toHaveBeenCalled()
            done()
        })

    });
    

    it('Expect comment delete to redirect to origin if referer header is supplied', (done) => {
        const origin = 'http://127.0.0.1:3000';
        toggleAuthTestVariable(true);

        request(app)
        .delete('/comment')
        .set('Referer', origin)
        .set('Accept', 'application/json')
        .send({ _id: commentId})
        .expect(302)
        .end(async (err,res) => {
            if(err){return done(err)}
            expect(mockDeleteOne).toHaveBeenCalled()
            done()
        })

    });
    
    it('Expect comment creation to return an object with comment created status if referer header is not present', (done) => {
        toggleAuthTestVariable(true);

        request(app)
        .delete('/comment')
        .set('Accept', 'application/json')
        .send({ _id: commentId})
        .expect(200)
        .end(async (err,res) => {
            if(err){return done(err)}
            expect(mockDeleteOne).toHaveBeenCalled()
            expect(res.body).toHaveProperty('status', 'Comment deleted successfully.')
            done()
        })

    });
});



describe('Comment update should work if user authenticated and _id is validated', () => {
    
    const commentId = new mongoose.Types.ObjectId();
    const postId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    
   

    beforeEach(()=>{
        mockUpdateOne.mockClear()
    })

    it('Comment should not be updated if user is not authenticated', (done) => {
        toggleAuthTestVariable(false);

        request(app)
        .put('/comment')
        .set('Accept', 'application/json')
        .send({content: 'test content', _id: commentId, post: postId, user: userId})
        .expect(checkIfErrorsPresent)
        .expect(400)
        .end(async (err,res) => {
            if(err){return done(err)}
            expect(mockUpdateOne).not.toHaveBeenCalled()
            done()
        })

    });
    

    it('Comment should not be updated if _id is not in database', (done) => {
        toggleAuthTestVariable(true);
        databaseMockGenerator(mockCommentExists)(new mongoose.Types.ObjectId());

        request(app)
        .put('/comment')
        .set('Accept', 'application/json')
        .send({content: 'test content', _id: commentId, post: postId, user: userId})
        .expect(checkIfErrorsPresent)
        .expect(400)
        .end(async (err,res) => {
            if(err){return done(err)}
            expect(mockUpdateOne).not.toHaveBeenCalled()
            done()
        })

    });


    it('Expect comment update to redirect to origin if referer header is supplied', (done) => {
        const origin = 'http://127.0.0.1:3000';
        toggleAuthTestVariable(true);
        databaseMockGenerator(mockCommentExists)(commentId);

        request(app)
        .put('/comment')
        .set('Referer', origin)
        .set('Accept', 'application/json')
        .send({content: 'test content', _id: commentId, post: postId, user: userId})
        .expect(302)
        .end(async (err,res) => {
            if(err){return done(err)}
            expect(mockUpdateOne).toHaveBeenCalled()
            done()
        })

    });
    
    it('Expect comment creation to return an object with comment created status if referer header is not present', (done) => {
        toggleAuthTestVariable(true);
        databaseMockGenerator(mockCommentExists)(commentId);

        request(app)
        .put('/comment')
        .set('Accept', 'application/json')
        .send({content: 'test content', _id: commentId, post: postId, user: userId})
        .expect(200)
        .end(async (err,res) => {
            if(err){return done(err)}
            expect(mockUpdateOne).toHaveBeenCalled()
            expect(res.body).toHaveProperty('status', 'Comment updated successfully.')
            done()
        })

    });
});



   

