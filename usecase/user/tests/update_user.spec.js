import { it, describe, expect, beforeAll } from 'vitest'
import request from 'supertest'
import { app } from '../../../cmd/main.js'
import prisma from '../../../infra/database/prisma.js'

describe('Update User (Integration)', () => {
  let userToken = '';
  let userId = null;

  const originalUser = {
    name: 'Luca Original',
    email: 'original.update@teste.com',
    password: 'password123'
  };

  const updatedData = {
    name: 'Luca Atualizado',
    email: 'atualizado.final@teste.com'
  };

  beforeAll(async () => {
    // 1. Limpeza
    await prisma.users.deleteMany();
    
    await prisma.role.upsert({
      where: { name: 'Default' },
      update: {},
      create: { name: 'Default' }
    });

    // 2. Cria o usuário via rota de cadastro
    const registerRes = await request(app).post('/cadastro').send(originalUser);
    userId = registerRes.body.userId || registerRes.body.id;

    // 3. Login para obter o token e passar pelo middleware 'auth'
    const loginRes = await request(app).post('/login').send({
      email: originalUser.email,
      password: originalUser.password
    });
    userToken = loginRes.body.token;
  });

  it('deve ser capaz de atualizar os próprios dados usando PATCH', async () => {
    // Ajustado para o prefixo /admin e método .patch() conforme sua rota
    const response = await request(app)
      .patch(`/atualizar-usuario/${userId}`) 
      .set('Authorization', `Bearer ${userToken}`)
      .send(updatedData);

    expect(response.status).toBe(200);
    expect(response.body.message).toMatch(/sucesso/i);
  });

  it('deve garantir que o nome e e-mail foram alterados no banco', async () => {
    const userInDb = await prisma.users.findUnique({
      where: { id: Number(userId) }
    });

    expect(userInDb.name).toBe(updatedData.name);
    expect(userInDb.email).toBe(updatedData.email);
  });

  it('deve bloquear a atualização se o usuário tentar atualizar outro ID (isOwnerOrAdmin)', async () => {
    // 1. Criar um segundo usuário
    const secondUser = await request(app).post('/cadastro').send({
      name: 'Outro Usuario',
      email: 'outro.cara@teste.com',
      password: 'password123'
    });
    const secondUserId = secondUser.body.userId || secondUser.body.id;

    // 2. O primeiro usuário (Luca) tenta atualizar o segundo usuário
    const response = await request(app)
      .patch(`/atualizar-usuario/${secondUserId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Hacker' });

    // O middleware isOwnerOrAdmin deve retornar 403 (Forbidden)
    expect(response.status).toBe(403);
  });

  it('deve retornar 401 para requisições sem token (middleware auth)', async () => {
    const response = await request(app)
      .patch(`/atualizar-usuario/${userId}`)
      .send(updatedData);

    expect(response.status).toBe(401);
  });
});