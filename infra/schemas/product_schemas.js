import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  price: z.number().positive("Preço deve ser positivo"),
  stock: z.number().int().nonnegative().optional(),
  description: z.string().optional()
});

export const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  // O coerce garante que o preço e o estoque sejam convertidos para número
  price: z.coerce.number().positive().optional(),
  stock: z.coerce.number().int().nonnegative().optional()
});