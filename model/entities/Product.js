export class Product {
  constructor({ id, name, description, price, stock, createdAt, updatedAt }) {
    this.id = id;
    this.name = name;
    this.description = description;
    
    // Garante que o preço venha como número para o restante do sistema
    // ou mantém como Decimal se você for fazer cálculos matemáticos complexos
    this.price = price; 
    
    // Garante que o estoque nunca seja undefined caso não venha do banco
    this.stock = stock ?? 0; 
    
    this.createdAt = createdAt;
    this.updatedAt = updatedAt; // Adicionado para bater com o banco
  }

  // DICA EXTRA: Você pode criar métodos de negócio dentro da classe
  // para aquela função de "alterar preço" que você mencionou
  updatePrice(newPrice) {
    if (newPrice < 0) {
      throw new Error("O preço não pode ser negativo.");
    }
    this.price = newPrice;
  }
}