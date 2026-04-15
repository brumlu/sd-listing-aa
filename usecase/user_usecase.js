import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../model/User.js'; // Importe a entidade User para o Create

export class CreateUser {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute({ email, name, password }) {
    // 1. Regra de Negócio: Não permitir emails duplicados
    const userAlreadyExists = await this.userRepository.findByEmail(email);
    if (userAlreadyExists) {
      throw new Error('Este email já está em uso.');
    }

    // 2. Processamento de dados: Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Criar a Entidade de Domínio
    // É boa prática criar a entidade antes de mandar para o repo
    const userEntity = new User({
      email,
      name,
      password: hashedPassword
    });

    // 4. Persistência
    return await this.userRepository.create(userEntity);
  }
}

export class LoginUser {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute({ email, password }) {
    // 1. Busca o usuário (Usando o método que retorna { user, permissions })
    const result = await this.userRepository.findByEmailWithPermissions(email);

    // 2. Valida existência
    if (!result || !result.user) {
      throw new Error('Credenciais inválidas');
    }

    const { user, permissions } = result;

    // 3. Valida a senha (acessando user.password da entidade)
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Credenciais inválidas');
    }

    // 4. Gera o Token
    // Usamos as permissões que o repositório já buscou e formatou
    const token = jwt.sign(
      { 
        id: user.id, 
        permissions: permissions 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return { token };
  }
}