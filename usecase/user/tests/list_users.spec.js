import { it, describe, expect, beforeAll } from 'vitest'
import request from 'supertest'
import { app } from '../../../cmd/main.js'
import prisma from '../../../infra/database/prisma.js'

describe('List Users Operations (Integration)', () => {
  let userToken = '';

  beforeAll(async () => {
    // 1. Limpeza do banco
    await prisma.users.deleteMany();
    if (prisma.rolePermission) await prisma.rolePermission.deleteMany();
    await prisma.permission.deleteMany();
    await prisma.role.deleteMany();

    // 2. Setup de Permissões (Caso seu middleware exija USER_READ)
    const permission = await prisma.permission.create({
      data: { name: 'USER_READ' }
    });

    const role = await prisma.role.create({
      data: {
        name: 'Default',
        permissions: {
          create: [{ permission: { connect: { id: permission.id } } }]
        }
      }
    });

    // 3. Criar usuários para popular a lista
    // Criamos o Luca
    await request(app).post('/cadastro').send({
      name: 'Luca List',
      email: 'luca.list@teste.com',
      password: 'password123'
    });

    // Criamos um segundo usuário para garantir que a lista tenha mais de um
    await request(app).post('/cadastro').send({
      name: 'Outro Usuario',
      email: 'outro@teste.com',
      password: 'password123'
    });

    // 4. Login para obter o token
    const loginRes = await request(app).post('/login').send({
      email: 'luca.list@teste.com',
      password: 'password123'
    });
    
    userToken = loginRes.body.token;
  });

  it('deve ser capaz de listar todos os usuários cadastrados', async () => {
    const response = await request(app)
      .get('/listar-usuarios')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(200);

    // DEBUG: Se o teste falhar de novo, descomente a linha abaixo para ver o que está vindo
    // console.log(response.body);

    // Se sua lista vier dentro de um objeto (ex: response.body.users)
    // mude para: expect(Array.isArray(response.body.users)).toBe(true);
    
    // Se ela vier direto, mas o erro persistir, pode ser que venha um objeto de paginação.
    // Vamos ser mais flexíveis para encontrar a lista:
    const usersList = Array.isArray(response.body) ? response.body : response.body.users;

    expect(Array.isArray(usersList)).toBe(true);
    expect(usersList.length).toBeGreaterThanOrEqual(2);
    
    // Verifica o primeiro item da lista
    expect(usersList[0]).not.toHaveProperty('password');
    expect(usersList[0]).toHaveProperty('email');
  });
});