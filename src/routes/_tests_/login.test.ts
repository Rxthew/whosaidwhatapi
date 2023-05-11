
import {Request, Response as expressRes, NextFunction} from 'express';
import request from 'supertest';
import { Response } from 'supertest'
import app from '../../testapp';
import passport from 'passport';

jest.mock("passport", () => ({
    __esModule: true,
    default: {
        authenticate: () => {
            return (req:Request, res:expressRes, next:NextFunction) => {
                res.json({test: 'authenticated'})
            }
        }
    }
}));

const addOns = function(){
    
    const checkIfErrorsPresent = function(res:Response){
        if(!('errors' in res.body)){throw new Error('Errors object not present')}
    };

    const origin = 'http://localhost:3000';
    return {
        checkIfErrorsPresent,
        origin,
    }

};


describe('Login should call authenticate when passing validation, else it should redirect or return errors.', ()=>{

    const { checkIfErrorsPresent, origin } = addOns();

    it('Request supplied without Referer header field should throw an error', (done) =>{
        request(app)
        .post('/login')
        .set('Accept','application/json')
        .send({username: 'janedoe', password: 'janedoe1'})
        .expect(checkIfErrorsPresent)
        .expect(400,done)
    });

    it('Valid credentials should call authentication', (done) => {
        request(app)
        .post('/login')
        .set('Referer', origin)
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

