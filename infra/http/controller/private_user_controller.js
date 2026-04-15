export class PrivateUserController {
  constructor(useCases) {
    this.useCases = useCases; // Objeto contendo todos os use cases
  }

  async listar(req, res) {
    try {
      const users = await this.useCases.listUsers.execute();
      return res.status(200).json({ message: 'Lista de usuários', users });
    } catch (err) {
      return res.status(500).json({ message: 'Erro ao listar usuários' });
    }
  }

  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { name, email } = req.body;
      await this.useCases.updateUser.execute(id, { name, email });
      return res.status(200).json({ message: 'Usuário atualizado com sucesso' });
    } catch (err) {
      return res.status(500).json({ message: 'Erro ao atualizar' });
    }
  }

  async atualizarSenha(req, res) {
    try {
      await this.useCases.updatePassword.execute(req.params.id, req.body.password);
      return res.status(200).json({ message: 'Senha atualizada' });
    } catch (err) {
      return res.status(500).json({ message: 'Erro ao atualizar senha' });
    }
  }

  async deletar(req, res) {
    try {
      await this.useCases.deleteUser.execute(req.params.id);
      return res.status(200).json({ message: 'Deletado com sucesso' });
    } catch (err) {
      return res.status(500).json({ message: 'Erro ao deletar' });
    }
  }

  async setupAdmin(req, res) {
    try {
      const MASTER_KEY = "123";
      if (req.headers['x-master-key'] !== MASTER_KEY) return res.status(403).send("Negado");
      
      await this.useCases.changeRole.promoteToAdmin(req.params.id);
      return res.status(200).json({ message: "Promovido a ADMIN" });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }
}