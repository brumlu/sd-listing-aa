export class PublicUserController {
  constructor(createUserUseCase, loginUserUseCase) {
    this.createUserUseCase = createUserUseCase;
    this.loginUserUseCase = loginUserUseCase;
  }

  async cadastro(req, res) {
    try {
      const { email, name, password } = req.body;

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

  async login(req, res) {
    try {
      const { email, password } = req.body;

      // await é obrigatório
      const result = await this.loginUserUseCase.execute({ email, password });

      return res.status(200).json({ token: result.token });

    } catch (err) {
      // Log de erro no console
      console.error(err);
      return res.status(401).json({ message: err.message || 'Erro no login' });
    }
  }
}