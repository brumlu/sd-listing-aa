export class AddAddressUseCase {
  constructor(addressRepository, userRepository) {
    this.addressRepository = addressRepository;
    this.userRepository = userRepository;
  }

  async execute({ userId, isDefault, ...addressData }) {
    // 1. Validar se o usuário existe
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error("Usuário não encontrado");

    // 2. Criar o endereço
    const newAddress = await this.addressRepository.create({
      ...addressData,
      userId
    });

    // 3. Regra de Negócio: Se for o primeiro endereço OU isDefault for true,
    // atualizamos o defaultAddressId no Usuário (Opção 2 Rigorosa)
    if (isDefault || !user.defaultAddressId) {
      await this.userRepository.updateDefaultAddress(userId, newAddress.id);
    }

    return newAddress;
  }
}

export class ListUserAddressesUseCase {
  constructor(addressRepository) {
    this.addressRepository = addressRepository;
  }

  async execute(userId) {
    // Retorna a lista de entidades Address
    return await this.addressRepository.findByUserId(userId);
  }
}

export class SetDefaultAddressUseCase {
  constructor(userRepository, addressRepository) {
    this.userRepository = userRepository;
    this.addressRepository = addressRepository;
  }

  async execute(userId, addressId) {
    // 1. Validar se o endereço existe e pertence ao usuário
    const address = await this.addressRepository.findById(addressId);
    
    if (!address || address.userId !== userId) {
      throw new Error("Endereço não encontrado ou não pertence a este usuário");
    }

    // 2. Atualizar o ponteiro no usuário
    return await this.userRepository.updateDefaultAddress(userId, addressId);
  }
}

export class DeleteAddressUseCase {
  constructor(addressRepository, userRepository) {
    this.addressRepository = addressRepository;
    this.userRepository = userRepository;
  }

  async execute({ userId, addressId, userRole }) {
    // 1. Busca o endereço para verificar se ele existe
    const address = await this.addressRepository.findById(addressId);

    if (!address) {
      return left(new ResourceNotFoundError("Endereço não encontrado"));
    }

    // 2. Validação de Permissão:
    // O usuário só pode deletar se for o DONO do endereço OU se for um ADMIN
    const isOwner = address.userId === userId;
    const isAdmin = userRole === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return left(new NotAllowedError("Você não tem permissão para excluir este endereço"));
    }

    // 3. Executa a deleção
    await this.addressRepository.delete(addressId);

    // Como o Prisma está com ON DELETE SET NULL no defaultAddressId do User,
    // o vínculo no perfil do usuário será limpo automaticamente pelo banco.

    return right(null);
  }
}

export class GetDefaultAddressUseCase {
  constructor(addressRepository) {
    this.addressRepository = addressRepository;
  }

  async execute(userId) {
    const defaultAddress = await this.addressRepository.findDefaultByUserId(userId);
    
    if (!defaultAddress) {
      throw new Error("Usuário não possui um endereço padrão definido");
    }

    return defaultAddress;
  }
}

export class GetAddressByIdUseCase {
  constructor(addressRepository) {
    this.addressRepository = addressRepository;
  }

  async execute(addressId) {
    const address = await this.addressRepository.findById(addressId);

    if (!address) {
      // Retorna erro padrão do seu sistema (Left)
      return left(new ResourceNotFoundError("Endereço não encontrado"));
    }

    return right(address);
  }
}