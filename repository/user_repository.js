import prisma from '../infra/database/prisma.js'; 
import { User } from '../model/entities/User.js'; // Importante para a conversão

export class UserRepository {
  
  // Busca simples por email
  async findByEmail(email) {
    const userData = await prisma.users.findUnique({
      where: { email },
    });

    if (!userData) return null;

    return new User({
      id: userData.id,
      name: userData.name,
      email: userData.email,
      password: userData.password,
      roleId: userData.roleId,
      createdAt: userData.createdAt
    });
  }

  // Busca completa para o Login (com permissões)
  async findByEmailWithPermissions(email) {
    const userData = await prisma.users.findUnique({
      where: { email },
      include: { 
        role: { 
          include: { permissions: true } 
        } 
      }
    });

    if (!userData) return null;

    // Retornamos um objeto contendo a Entidade + os dados de permissão
    // Isso evita "sujar" a entidade User com lógica de banco se você não quiser
    return {
      user: new User({
        id: userData.id,
        name: userData.name,
        email: userData.email,
        password: userData.password,
        roleId: userData.roleId,
        createdAt: userData.createdAt
      }),
      permissions: userData.role?.permissions.map(p => p.name) || []
    };
  }

  async create(userEntity) {
    const createdUser = await prisma.users.create({
      data: {
        email: userEntity.email,
        name: userEntity.name,
        password: userEntity.password,
        role: {
          connect: { name: 'ALUNO' }
        }
      },
    });

    // Retorna a nova entidade com o ID e data de criação gerados pelo Postgres
    return new User({
      id: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
      password: createdUser.password,
      roleId: createdUser.roleId,
      createdAt: createdUser.createdAt
    });
  }

  async findAll() {
  return await prisma.users.findMany({
    include: { 
      role: { select: { name: true, description: true } } 
    },
    omit: { password: true }
  });
}

  async update(id, data) {
    return await prisma.users.update({
      where: { id: Number(id) },
      data
    });
  }

  async delete(id) {
    return await prisma.users.delete({
      where: { id: Number(id) }
    });
  }

  async findRoleByName(name) {
    return await prisma.role.findUnique({ where: { name } });
  }
}