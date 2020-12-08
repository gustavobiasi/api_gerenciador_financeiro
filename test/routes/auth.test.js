const request = require('supertest');
const app = require('../../src/app');

test('Deve criar usuário via signup', () => {
  return request(app).post('/auth/signup')
    .send({ name: 'Walter', mail: `${Date.now()}@gmail.com`, password: '123456' })
    .then(res => {
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Walter');
      expect(res.body).not.toHaveProperty('password');
    })
})

test('Deve receber token ao logar', () => {
    const mail = `${Date.now()}@gmail.com`;    
    return app.services.user.save(
        {name: 'Walter', mail, password: '123456'}
    ).then(() => request(app).post('/auth/signin')
       .send({mail, password: '123456'}))
       .then((res) => {
         expect(res.status).toBe(200);         
         expect(res.body).toHaveProperty('token');
       });
});

test('Não deve autenticar usuário com senha errada', () => {
    const mail = `${Date.now()}@gmail.com`;    
    return app.services.user.save(
        {name: 'Walter', mail, password: '123456'}
    ).then(() => request(app).post('/auth/signin')
       .send({mail, password: '4647732'}))
       .then((res) => {
         expect(res.status).toBe(400);         
         expect(res.body.error).toBe('Usuario ou senha errado');
       });
});

test('Não deve autenticar usuário que não existe', () => {
    return request(app).post('/auth/signin')
       .send({mail: 'ulala@gmail.com', password: '4647732'})
       .then((res) => {
         expect(res.status).toBe(400);         
         expect(res.body.error).toBe('Usuario ou senha errado');
       });
});

test('Não deve acessar uma rota protegida sem token', () => {
    return request(app).get('/v1/users')
			.then(res => {
				expect(res.status).toBe(401);
			});
});