export class User {
  constructor({ 
    id, 
    name, 
    email, 
    password, 
    roleId, 
    defaultAddressId = null,
    createdAt = new Date(),
    updatedAt = new Date() 
  }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.roleId = roleId;
    this.defaultAddressId = defaultAddressId; // Referência ao endereço padrão
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;

    // Validação básica de domínio
    if (!email || !email.includes('@')) {
      throw new Error("Email inválido");
    }
  }

  // Ocultar a senha ao retornar dados
  toJSON() {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}