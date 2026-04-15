export class PublicUserController {
  constructor(createUserUseCase, loginUserUseCase) {
    this.createUserUseCase = createUserUseCase;
    this.loginUserUseCase = loginUserUseCase;
  }

  // Lógica de Cadastro
  async cadastro(req, res) {
    try {
      const { email, name, password } = req.body;

      // Chama o caso de uso de criação
      const user = await this.createUserUseCase.execute({ email, name, password });

      return res.status(201).json({ 
        message: 'Usuário cadastrado com sucesso',
        userId: user.id 
      });
    } catch (error) {
      // Diferencia erro de negócio (400) de erro de servidor (500)
      const status = error.message === 'Este email já está em uso.' ? 400 : 500;
      return res.status(status).json({ message: error.message });
    }
  }

  // Lógica de Login (Refatorada do código antigo)
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Agora toda a lógica de bcrypt, prisma e jwt está no Use Case
      const { token } = await this.loginUserUseCase.execute({ email, password });

      // Retorna o token para o cliente
      return res.status(200).send(token);
    } catch (error) {
      // Erro de credenciais é sempre 401 (Não autorizado)
      const status = error.message === 'Credenciais inválidas' ? 401 : 500;
      return res.status(status).json({ message: error.message });
    }
  }
}