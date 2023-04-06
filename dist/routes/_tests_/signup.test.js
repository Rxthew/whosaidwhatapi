"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const testapp_1 = __importDefault(require("../../testapp"));
describe('Sign up with correct credentials should redirect to host', () => {
    const origin = 'http://127.0.0.1:3000';
    it('Correct credentials for admin user.', (done) => {
        (0, supertest_1.default)(testapp_1.default)
            .post('/signup')
            .set('Referer', origin)
            .send({ first_name: 'Jane', last_name: 'Doe', username: 'janedoe', password: 'janedoe1', privilege_code: '1234', admin_code: '4321' })
            .expect(302)
            .end((err, res) => {
            if (err) {
                return done(err);
            }
            expect(res.header.location).toEqual(origin);
            done();
        });
    });
    it('Correct credentials for privileged user.', (done) => {
        (0, supertest_1.default)(testapp_1.default)
            .post('/signup')
            .set('Referer', origin)
            .send({ first_name: 'Jane', last_name: 'Doe', username: 'janedoe', password: 'janedoe1', privilege_code: '1234' })
            .expect(302)
            .end((err, res) => {
            if (err) {
                return done(err);
            }
            expect(res.header.location).toEqual(origin);
            done();
        });
    });
    it('Correct credentials for regular user.', (done) => {
        (0, supertest_1.default)(testapp_1.default)
            .post('/signup')
            .set('Referer', origin)
            .send({ first_name: 'Jane', last_name: 'Doe', username: 'janedoe', password: 'janedoe1' })
            .expect(302)
            .end((err, res) => {
            if (err) {
                return done(err);
            }
            expect(res.header.location).toEqual(origin);
            done();
        });
    });
});
describe('Sign up with incorrect credential should return errors.json', () => {
    const _checkIfErrorsPresent = function (res) {
        if (!('errors' in res.body)) {
            throw new Error('Errors object not present');
        }
    };
    const origin = 'http://localhost:3000';
    it('Request supplied without Referer header field should throw an error', (done) => {
        (0, supertest_1.default)(testapp_1.default)
            .post('/signup')
            .set('Accept', 'application/json')
            .send({ first_name: 'Jane', last_name: 'Doe', username: 'janedoe', password: 'janedoe1' })
            .expect(_checkIfErrorsPresent)
            .expect(400, done);
    });
    it('Incorrect credentials for admin user should throw an error', (done) => {
        (0, supertest_1.default)(testapp_1.default)
            .post('/signup')
            .set('Accept', 'application/json')
            .set('Referer', origin)
            .send({ first_name: 'Jane', last_name: 'Doe', username: 'janedoe', password: 'janedoe1', privilege_code: '1234', admin_code: '1234' })
            .expect(_checkIfErrorsPresent)
            .expect(400, done);
    });
    it('Incorrect credentials for privileged user should throw an error', (done) => {
        (0, supertest_1.default)(testapp_1.default)
            .post('/signup')
            .set('Accept', 'application/json')
            .set('Referer', origin)
            .send({ first_name: 'Jane', last_name: 'Doe', username: 'janedoe', password: 'janedoe1', privilege_code: '4321', admin_code: '4321' })
            .expect(_checkIfErrorsPresent)
            .expect(400, done);
    });
    it('Incorrect credentials for regular user should throw an error', (done) => {
        (0, supertest_1.default)(testapp_1.default)
            .post('/signup')
            .set('Accept', 'application/json')
            .set('Referer', origin)
            .send({ first_name: 'Jane', last_name: 'Doe', username: 'janedoe' })
            .expect(_checkIfErrorsPresent)
            .expect(400, done);
    });
});
