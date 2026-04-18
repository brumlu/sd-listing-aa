import { it, describe, expect, beforeAll } from 'vitest'
import request from 'supertest'
import { app } from '../../../cmd/main.js'
import prisma from '../../../infra/database/prisma.js'

describe('Login Operations (Integration)', () => {
  const loginUser = {
    name: 'Luca Login',
    email: 'login@teste.com',
    password: 'password123'
  };

  beforeAll(async () => {
    // 1. Limpeza
    await prisma.users.deleteMany();

    // 2. Garante a Role Default (necessária para o cadastro interno)
    try {
      await prisma.role.upsert({
        where: { name: 'Default' },
        update: {},
        create: { name: 'Default' }
      });
    } catch (e) {
      // Role já existe
    }

    // 3. Cadastra o usuário que vamos usar para logar
    // Fazemos isso via request para garantir que a senha seja hasheada pelo seu UseCase
    await request(app)
      .post('/cadastro')
      .send(loginUser);
  });

  it('deve ser capaz de autenticar um usuário e receber um token JWT', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        email: loginUser.email,
        password: loginUser.password
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    // Verifica se o token tem o formato JWT (começa com ey...)
    expect(response.body.token).toMatch(/^ey/);
  });

  it('não deve logar com uma senha incorreta', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        email: loginUser.email,
        password: 'senha_errada'
      });

    expect(response.status).toBe(401);
    expect(response.body.token).toBeUndefined();
    expect(response.body.message).toMatch(/inválid/i);
  });

  it('não deve logar com um e-mail que não existe no sistema', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        email: 'naoexiste@teste.com',
        password: 'password123'
      });

    expect(response.status).toBe(401);
  });

  it('deve retornar erro 400 se o corpo da requisição estiver incompleto', async () => {
    const response = await request(app)
      .post('/login')
      .send({ email: loginUser.email }); // Faltando password

    expect(response.status).toBe(400);
  });
});