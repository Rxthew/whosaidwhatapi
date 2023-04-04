

import request from 'supertest';
import app from '../../testapp';
import { Response } from 'supertest'

describe('Sign up with correct credentials should redirect to host', ()=>{
    const origin = 'http://localhost:3000'
    it('Correct credentials for admin user.', (done) => {
        request(app)
        .post('/signup')
        .set('Host', origin)
        .send({first_name: 'Jane', last_name: 'Doe', username: 'janedoe', password: 'janedoe', privilege_code: '1234', admin_code: '4321'})
        .expect(302)
        .end((err,res) => {
            if(err){return done(err)}
            expect(res.header.location).toEqual(origin)
            done()
        })
        

    });
    it('Correct credentials for privileged user.', (done) => {
        request(app)
        .post('/signup')
        .set('Host', origin)
        .send({first_name: 'Jane', last_name: 'Doe', username: 'janedoe', password: 'janedoe', privilege_code: '1234'})
        .expect(302)
        .end((err,res) => {
            if(err){return done(err)}
            expect(res.header.location).toEqual(origin)
            done()
        })
    });
    it('Correct credentials for regular user.', (done) => {
        request(app)
        .post('/signup')
        .set('Host', origin)
        .send({first_name: 'Jane', last_name: 'Doe', username: 'janedoe', password: 'janedoe'})
        .expect(302)
        .end((err,res) => {
            if(err){return done(err)}
            expect(res.header.location).toEqual(origin)
            done()
        })
    });

});

describe('Sign up with incorrect credential should return errors.json',()=>{
    const _checkIfErrorsPresent = function(res:Response){
        if(!('errors' in res.body)){throw new Error('Errors object not present')}
    }

    it('Incorrect credentials for admin user', (done)=>{
        request(app)
        .post('/signup')
        .set('Accept','application/json')
        .send({first_name: 'Jane', last_name:'Doe', username: 'janedoe', password: 'janedoe', privilege_code:'1234'})
        .expect(_checkIfErrorsPresent)
        .expect(400,done)
    })
    it('Incorrect credentials for privileged user', (done)=>{
        request(app)
        .post('/signup')
        .set('Accept','application/json')
        .send({first_name: 'Jane', last_name:'Doe', username: 'janedoe', password: 'janedoe'})
        .expect(_checkIfErrorsPresent)
        .expect(400,done)
    })
    it('Incorrect credentials for regular user', (done)=>{
        request(app)
        .post('/signup')
        .set('Accept','application/json')
        .send({first_name: 'Jane', last_name:'Doe', username: 'janedoe'})
        .expect(_checkIfErrorsPresent)
        .expect(400,done)
    })
   
});
    




