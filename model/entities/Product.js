export class Product {
  constructor({ id, name, description, price, stock, createdAt, updatedAt }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.price = price; 
    this.stock = stock ?? 0; // Garante que o estoque nunca seja undefined caso não venha do banco
    this.createdAt = createdAt;
    this.updatedAt = updatedAt; // Adicionado para bater com o banco
  }

  updatePrice(newPrice) {
    if (newPrice < 0) {
      throw new Error("O preço não pode ser negativo.");
    }
    this.price = newPrice;
  }
}