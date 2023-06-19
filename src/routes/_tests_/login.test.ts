
import {Request, Response, NextFunction} from 'express';
import request from 'supertest';
import app from '../../testapp';
import passport from 'passport';

jest.mock("passport", () => ({
    __esModule: true,
    default: {
        authenticate: () => {
            return (req:Request, res:Response, next:NextFunction) => {
                res.json({test: 'authenticated'})
            }
        }
    }
}));


describe('Login should call authenticate when passing validation, else it should redirect or return errors.', ()=>{

    it('Valid credentials should call authentication', (done) => {
        request(app)
        .post('/login')
        .set('Origin', 'http://localhost:3000')
        .set('Accept','application/json')
        .send({username: 'janedoe', password: 'janedoe1'})
        .expect(200)
        .end(async (err,res) => {
            if(err){return done(err)}
            expect(res.body).toEqual({test: 'authenticated'})
            done()
        })
    });

});

