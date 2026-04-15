export class User {
  constructor({ id, name, email, password, roleId, createdAt }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.roleId = roleId;
    this.createdAt = createdAt;

    // Validação de negócio simples
    if (!email.includes('@')) {
      throw new Error("Email inválido");
    }
  }

  // Comportamento: Por exemplo, ocultar a senha ao retornar dados
  toJSON() {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}