
import request from 'supertest';
import { Response } from 'supertest'
import app from '../../testapp';
import {User} from '../../models/user'


jest.mock('../../models/user');

const generateMocks = function(){
    const mockFindOne = jest.fn();
    const mockSave = jest.fn();

    return {
        mockFindOne,
        mockSave,
    }
};


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

const {mockFindOne, mockSave} = generateMocks();
const { checkIfErrorsPresent, origin} = addOns()

User.findOne = mockFindOne;
User.prototype.save = mockSave;


describe("Sign up should work when saving user, but should throw error if same username",() => {

    const databaseMockImplementation = function(name:string){
        return mockFindOne.mockImplementationOnce((queryObject: Record<string,string>)=>{
            return queryObject && queryObject.username === name
        });
    };
        
    beforeEach(()=>{
        mockSave.mockClear()
    })

    const origin = 'http://127.0.0.1:3000';
    databaseMockImplementation('jackdoe');

    it('Expect redirection to origin with save being called',(done) => {
        request(app)
        .post('/signup')
        .set('Referer', origin)
        .send({first_name: 'John', last_name: 'Doe', username: 'johndoe', password: 'johndoe1', privilege_code: '1234', admin_code: '4321'})
        .expect(302)
        .end(async (err,res) => {
            if(err){return done(err)}
            expect(mockFindOne).lastReturnedWith(false)
            expect(mockSave).toHaveBeenCalled()
            done()
        })
    });

    databaseMockImplementation('johndoe')

    it('Expect bad request if duplicate usernames, with save not being called',(done) => {
        request(app)
        .post('/signup')
        .set('Referer', origin)
        .send({first_name: 'John', last_name: 'Doe', username: 'johndoe', password: 'johndoe1', privilege_code: '1234', admin_code: '4321'})
        .expect(checkIfErrorsPresent)
        .expect(400)
        .end(async (err,res) => {
            if(err){return done(err)}
            expect(mockFindOne).lastReturnedWith(true)
            expect(mockSave).not.toHaveBeenCalled()
            done()
        })
    });
    

});

describe('Sign up with correct credentials should redirect to origin', ()=>{

    const origin = 'http://127.0.0.1:3000';
    it('Correct credentials for admin user.', (done) => {        
        request(app)
        .post('/signup')
        .set('Referer', origin)
        .send({first_name: 'Jane', last_name: 'Doe', username: 'janedoe', password: 'janedoe1', privilege_code: '1234', admin_code: '4321'})
        .expect(302)
        .end(async (err,res) => {
            if(err){return done(err)}
            expect(res.header.location).toEqual(origin)
            done()
        })        

    });
    it('Correct credentials for privileged user.', (done) => {
        request(app)
        .post('/signup')
        .set('Referer', origin)
        .send({first_name: 'Jane', last_name: 'Doe', username: 'janedoe', password: 'janedoe1', privilege_code: '1234'})
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
        .set('Referer', origin)
        .send({first_name: 'Jane', last_name: 'Doe', username: 'janedoe', password: 'janedoe1'})
        .expect(302)
        .end((err,res) => {
            if(err){return done(err)}
            expect(res.header.location).toEqual(origin)
            done()
        })
    });

});

describe('Sign up with incorrect credential should return errors.json',()=>{
   
    it('Request supplied without Referer header field should throw an error', (done) =>{
        request(app)
        .post('/signup')
        .set('Accept','application/json')
        .send({first_name: 'Jane', last_name: 'Doe', username: 'janedoe', password: 'janedoe1'})
        .expect(checkIfErrorsPresent)
        .expect(400,done)
    })
    it('Incorrect credentials for admin user should throw an error', (done)=>{
        request(app)
        .post('/signup')
        .set('Accept','application/json')
        .set('Referer', origin)
        .send({first_name: 'Jane', last_name:'Doe', username: 'janedoe', password: 'janedoe1', privilege_code:'1234', admin_code:'1234'})
        .expect(checkIfErrorsPresent)
        .expect(400,done)
    })
    it('Incorrect credentials for privileged user should throw an error', (done)=>{
        request(app)
        .post('/signup')
        .set('Accept','application/json')
        .set('Referer', origin)
        .send({first_name: 'Jane', last_name:'Doe', username: 'janedoe', password: 'janedoe1', privilege_code:'4321', admin_code:'4321'})
        .expect(checkIfErrorsPresent)
        .expect(400,done)
    })
    it('Incorrect credentials for regular user should throw an error', (done)=>{
        request(app)
        .post('/signup')
        .set('Accept','application/json')
        .set('Referer', origin)
        .send({first_name: 'Jane', last_name:'Doe', username: 'janedoe'})
        .expect(checkIfErrorsPresent)
        .expect(400,done)
    })
   
});
    



