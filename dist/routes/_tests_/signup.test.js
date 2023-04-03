"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const testapp_1 = __importDefault(require("../../testapp"));
//Sample Test
describe('this test', () => {
    it('this', (done) => {
        (0, supertest_1.default)(testapp_1.default)
            .get('/signup')
            .expect('Content-Type', /json/)
            .expect({ test: 'tested' })
            .expect(200, done);
    });
});
