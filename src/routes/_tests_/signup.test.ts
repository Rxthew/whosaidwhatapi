
import request from 'supertest';
import app from '../../testapp';

//Sample Test
describe('this test', ()=>{
    it('this', (done) => {
        request(app)
        .get('/signup')
        .expect('Content-Type',/json/)
        .expect({test: 'tested'})
        .expect(200,done)

});
})
    




