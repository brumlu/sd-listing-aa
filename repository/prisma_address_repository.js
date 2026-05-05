import prisma from '../infra/database/prisma.js'; 
import { Address } from '../model/entities/Address.js'; 

export class AddressRepository {
  
  // Transforma o objeto do Prisma em uma Entidade de Domínio Address
  #mapToEntity(addressData) {
    if (!addressData) return null;
    return new Address({
      id: addressData.id,
      street: addressData.street,
      number: addressData.number,
      complement: addressData.complement,
      neighborhood: addressData.neighborhood,
      city: addressData.city,
      state: addressData.state,
      zipCode: addressData.zipCode,
      userId: addressData.userId,
      createdAt: addressData.createdAt,
      updatedAt: addressData.updatedAt
    });
  }

  // --- MÉTODOS DE ESCRITA ---

  async create(addressEntity) {
    const createdAddress = await prisma.address.create({
      data: {
        street: addressEntity.street,
        number: addressEntity.number,
        complement: addressEntity.complement,
        neighborhood: addressEntity.neighborhood,
        city: addressEntity.city,
        state: addressEntity.state,
        zipCode: addressEntity.zipCode,
        userId: addressEntity.userId
      }
    });

    return this.#mapToEntity(createdAddress);
  }

  async update(id, data) {
    const updatedAddress = await prisma.address.update({
      where: { id },
      data
    });

    return this.#mapToEntity(updatedAddress);
  }

  async delete(id) {
    const deletedAddress = await prisma.address.delete({
      where: { id }
    });

    return this.#mapToEntity(deletedAddress);
  }

  // --- MÉTODOS DE BUSCA ---

  async findById(id) {
    const addressData = await prisma.address.findUnique({
      where: { id }
    });

    return this.#mapToEntity(addressData);
  }

  /**
   * Busca todos os endereços de um usuário específico
   */
  async findByUserId(userId) {
    const addresses = await prisma.address.findMany({
      where: { userId }
    });

    return addresses.map(addr => this.#mapToEntity(addr));
  }

  /**
   * Busca o endereço que está marcado como padrão para um usuário.
   * Utiliza a relação inversa através da tabela Users (Opção 2)
   */
  async findDefaultByUserId(userId) {
    const userWithDefault = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        defaultAddress: true // O Prisma faz o join com a tabela de endereços automaticamente
      }
    });

    return this.#mapToEntity(userWithDefault?.defaultAddress);
  }

    async findById(id) {
    const address = await prisma.address.findUnique({
        where: { id }
    });

    return address;
    }
}