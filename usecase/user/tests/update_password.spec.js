import { it, describe, expect, beforeAll } from 'vitest'
import request from 'supertest'
import { app } from '../../../cmd/main.js'
import prisma from '../../../infra/database/prisma.js'

describe('Update Password (Integration)', () => {
  let userToken = '';
  let userId = null;

  const userCredentials = {
    name: 'Luca Update',
    email: 'update@teste.com',
    oldPassword: 'password123',
    newPassword: 'newPassword456' // A senha que queremos definir
  };

  beforeAll(async () => {
    await prisma.users.deleteMany();

    await prisma.role.upsert({
      where: { name: 'Default' },
      update: {},
      create: { name: 'Default' }
    });

    // 1. Cadastra o usuário com a senha inicial
    const registerRes = await request(app).post('/cadastro').send({
      name: userCredentials.name,
      email: userCredentials.email,
      password: userCredentials.oldPassword
    });

    userId = registerRes.body.userId || registerRes.body.id;

    // 2. Login para garantir que o token é válido
    const loginRes = await request(app).post('/login').send({
      email: userCredentials.email,
      password: userCredentials.oldPassword
    });
    userToken = loginRes.body.token;
  });

  it('deve ser capaz de alterar a própria senha usando o ID na rota', async () => {
    const response = await request(app)
      .patch(`/atualizar-senha/${userId}`) 
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        // AJUSTE AQUI: Seu controller espera "password" e não "newPassword"
        password: userCredentials.newPassword 
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toMatch(/sucesso/i);
  });

  it('deve conseguir logar com a nova senha', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        email: userCredentials.email,
        password: userCredentials.newPassword
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  it('NÃO deve conseguir logar com a senha antiga', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        email: userCredentials.email,
        password: userCredentials.oldPassword
      });

    // Como a senha mudou, a antiga deve dar 401
    expect(response.status).toBe(401);
  });
});