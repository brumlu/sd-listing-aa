import zod from 'zod';

const z = zod;

// Schema para CRIAÇÃO de endereço
export const createAddressSchema = z.object({
  street: z.string()
    .min(3, "A rua deve ter pelo menos 3 caracteres")
    .trim(),
    
  number: z.string()
    .min(1, "O número é obrigatório")
    .trim(),
    
  complement: z.string()
    .trim()
    .nullable()
    .optional(),
    
  neighborhood: z.string()
    .min(2, "Bairro inválido")
    .trim(),
    
  city: z.string()
    .min(2, "Cidade inválida")
    .trim(),
    
  state: z.string()
    .length(2, "Use a sigla do estado (ex: BA)")
    .transform(val => val.toUpperCase()),
    
  zipCode: z.string()
    .trim()
    .regex(/^\d{5}-?\d{3}$/, "CEP inválido (ex: 40000-000)"),

  userId: z.string().uuid("ID de usuário inválido"),
});

// Schema para ATUALIZAÇÃO de endereço
// O .partial() faz com que todos os campos acima se tornem opcionais
export const updateAddressSchema = createAddressSchema.partial();