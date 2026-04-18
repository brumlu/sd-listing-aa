import { it, describe, expect, beforeAll } from 'vitest'
import request from 'supertest'
import { app } from '../../../cmd/main.js'
import prisma from '../../../infra/database/prisma.js'

describe('Delete User (Integration)', () => {
  let userToken = '';
  let userId = null;

  const userToDelete = {
    name: 'User To Delete',
    email: 'delete@teste.com',
    password: 'password123'
  };

  beforeAll(async () => {
    // 1. Limpeza
    await prisma.users.deleteMany();

    // 2. Garante a Role
    await prisma.role.upsert({
      where: { name: 'Default' },
      update: {},
      create: { name: 'Default' }
    });

    // 3. Cadastra o usuário que será deletado
    const registerRes = await request(app).post('/cadastro').send(userToDelete);
    userId = registerRes.body.userId || registerRes.body.id;

    // 4. Obtém o token para autorizar a exclusão
    const loginRes = await request(app).post('/login').send({
      email: userToDelete.email,
      password: userToDelete.password
    });
    userToken = loginRes.body.token;
  });

  it('deve ser capaz de deletar o próprio usuário usando o ID na rota', async () => {
    // Verifique se sua rota é exatamente /deletar-minha-conta/:id
    const response = await request(app)
      .delete(`/deletar-minha-conta/${userId}`) 
      .set('Authorization', `Bearer ${userToken}`);

    expect([200, 204]).toContain(response.status);
  });

  it('NÃO deve ser capaz de logar após a conta ser deletada', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        email: userToDelete.email,
        password: userToDelete.password
      });

    // Como o usuário não existe mais, deve retornar 401 ou 404 dependendo da sua lógica
    expect([401, 404]).toContain(response.status);
  });

  it('deve garantir que o usuário realmente sumiu do banco de dados', async () => {
    const userInDb = await prisma.users.findUnique({
      where: { id: Number(userId) }
    });

    expect(userInDb).toBeNull();
  });

  it('deve negar a exclusão se o token não for enviado', async () => {
    const response = await request(app).delete(`/deletar-minha-conta/${userId}`);
    
    expect(response.status).toBe(401);
  });
});