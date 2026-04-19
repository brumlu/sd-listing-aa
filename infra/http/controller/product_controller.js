export class ProductController {
  constructor(useCases) {
    this.useCases = useCases;

    // Auto-bind de todos os métodos para evitar perda de contexto no roteador
    this.criar = this.criar.bind(this);
    this.listar = this.listar.bind(this);
    this.atualizar = this.atualizar.bind(this);
    this.deletar = this.deletar.bind(this);
    this.alterarPreco = this.alterarPreco.bind(this);
    this.alterarEstoque = this.alterarEstoque.bind(this);
  }

  async criar(req, res) {
    const { name, description, price, stock } = req.body;

    const result = await this.useCases.createProduct.execute({ 
      name, 
      description, 
      price, 
      stock 
    });

    if (result.isLeft()) throw result.value;

    return res.status(201).json({ 
      message: 'Produto criado com sucesso', 
      product: result.value 
    });
  }

  async listar(req, res) {
    const result = await this.useCases.listProducts.execute();
    
    return res.status(200).json({ 
      message: 'Lista de produtos', 
      products: result.value 
    });
  }

  async atualizar(req, res) {
    const { id } = req.params;
    const data = req.body;

    const result = await this.useCases.updateProduct.execute(id, data);

    if (result.isLeft()) throw result.value;

    return res.status(200).json({ 
      message: 'Produto atualizado com sucesso', 
      product: result.value 
    });
  }

  async deletar(req, res) {
    const { id } = req.params;

    const result = await this.useCases.deleteProduct.execute(id);

    if (result.isLeft()) throw result.value;

    return res.status(200).json({ message: 'Produto deletado com sucesso' });
  }

async alterarPreco(req, res) {
    try {
      const { id } = req.params;
      const { price } = req.body;

      // Passamos como objeto { price } para bater com a desestruturação do Use Case
      const result = await this.useCases.updatePrice.execute(id, { price });

      if (result.isLeft()) {
        const error = result.value;
        // Se for ResourceNotFoundError ou o statusCode for 404
        if (error.constructor.name === 'ResourceNotFoundError' || error.statusCode === 404) {
          return res.status(404).json({ status: 'error', message: error.message });
        }
        return res.status(400).json({ status: 'error', message: error.message });
      }

      return res.status(200).json({ 
        message: 'Preço alterado com sucesso', 
        product: result.value 
      });
    } catch (err) {
      return res.status(500).json({ message: 'Erro interno no servidor' });
    }
  }

async alterarEstoque(req, res) {
    try {
      const { id } = req.params;
      const { stock } = req.body; // Mudado de quantity para stock para bater com o Schema e Teste

      // Passamos como objeto { stock } para manter o padrão
      const result = await this.useCases.updateStock.execute(id, { stock });

      if (result.isLeft()) {
        const error = result.value;
        if (error.constructor.name === 'ResourceNotFoundError' || error.statusCode === 404) {
          return res.status(404).json({ status: 'error', message: error.message });
        }
        return res.status(400).json({ status: 'error', message: error.message });
      }

      return res.status(200).json({ 
        message: 'Estoque atualizado com sucesso', 
        product: result.value 
      });
    } catch (err) {
      return res.status(500).json({ message: 'Erro interno no servidor' });
    }
  }
}