export class AddressController {
  constructor(useCases) {
    this.useCases = useCases;

    // Auto-bind de todos os métodos para garantir que o 'this' funcione nas rotas
    this.adicionar = this.adicionar.bind(this);
    this.listarMeusEnderecos = this.listarMeusEnderecos.bind(this);
    this.deletar = this.deletar.bind(this);
    this.buscarEnderecoPadrao = this.buscarEnderecoPadrao.bind(this);
  }

  /**
   * POST /addresses
   * Cadastra um novo endereço para o usuário autenticado
   */
  async adicionar(req, res) {
    const userId = req.user.id; // Extraído do middleware de autenticação
    const { 
      street, 
      number, 
      complement, 
      neighborhood, 
      city, 
      state, 
      zipCode, 
      isDefault 
    } = req.body;

    const result = await this.useCases.addAddress.execute({
      userId,
      street,
      number,
      complement,
      neighborhood,
      city,
      state,
      zipCode,
      isDefault
    });

    if (result.isLeft()) throw result.value;

    return res.status(201).json({
      message: "Endereço cadastrado com sucesso",
      address: result.value
    });
  }

  /**
   * GET /addresses
   * Lista todos os endereços do usuário logado
   */
  async listarMeusEnderecos(req, res) {
    const userId = req.user.id;

    const result = await this.useCases.listAddresses.execute(userId);

    // No caso de listagem, se não houver erro, retornamos a lista (mesmo que vazia)
    return res.status(200).json({
      message: "Lista de endereços recuperada",
      addresses: result.value
    });
  }

  /**
   * GET /addresses/default
   * Busca especificamente o endereço marcado como padrão
   */
  async buscarEnderecoPadrao(req, res) {
    const userId = req.user.id;

    const result = await this.useCases.getDefaultAddress.execute(userId);

    if (result.isLeft()) throw result.value;

    return res.status(200).json({
      address: result.value
    });
  }

  /**
   * DELETE /addresses/:id
   * Remove um endereço específico após validar a posse
   */
  async deletar(req, res) {
    const userId = req.user.id;
    const { id: addressId } = req.params;

    const result = await this.useCases.deleteAddress.execute(userId, addressId);

    if (result.isLeft()) throw result.value;

    return res.status(200).json({
      message: "Endereço removido com sucesso"
    });
  }


  /**
   * GET /addresses/:id
   * Busca um endereço específico por ID. 
   * O middleware isOwnerOrAdmin garante que apenas o dono ou admin cheguem aqui.
   */
  async buscarPorId(req, res) {
    const { id: addressId } = req.params;

    // Chamamos o Use Case de busca
    const result = await this.useCases.getAddressById.execute(addressId);

    if (result.isLeft()) {
      throw result.value; // Lança erro de "Não encontrado" ou similar
    }

    return res.status(200).json({
      message: "Endereço encontrado",
      address: result.value
    });
  }
}