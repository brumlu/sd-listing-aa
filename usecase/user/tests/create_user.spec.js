import { it, describe, expect, beforeAll } from 'vitest'
import request from 'supertest'
import { app } from '../../../cmd/main.js'
import prisma from '../../../infra/database/prisma.js'

describe('Create User (Integration)', () => {
  
  beforeAll(async () => {
    // Limpa apenas usuários para este teste
    await prisma.users.deleteMany();
    
    // Garante a Role Default que o Repository exige
    try {
      await prisma.role.upsert({
        where: { name: 'Default' },
        update: {},
        create: { name: 'Default' }
      });
    } catch (e) {
      // Role já existe
    }
  });

  const newUser = {
    name: 'Luca Costa',
    email: 'luca.create@teste.com',
    password: 'password123'
  };

  it('deve ser capaz de cadastrar um novo usuário', async () => {
    const response = await request(app)
      .post('/cadastro')
      .send(newUser);

    expect([200, 201]).toContain(response.status);
    expect(response.body.message).toMatch(/sucesso/i);
  });

  it('não deve cadastrar um email que já existe no sistema', async () => {
    // O usuário já foi criado pelo teste de cima (estado persistido no arquivo)
    const response = await request(app)
      .post('/cadastro')
      .send(newUser);

    expect([400, 409]).toContain(response.status);
  });

  it('não deve cadastrar com dados inválidos (ex: email mal formatado)', async () => {
    const response = await request(app)
      .post('/cadastro')
      .send({ ...newUser, email: 'invalido' });

    expect(response.status).toBe(400);
  });
});