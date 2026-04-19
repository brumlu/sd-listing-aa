import { ZodError } from 'zod';

export const validate = (schema) => (req, res, next) => {
  try {
    // Captura os dados transformados pelo Zod (importante para converter strings em números)
    const validatedData = schema.parse(req.body);

    // Substitui o corpo da requisição pelos dados tipados corretamente
    req.body = validatedData;

    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const details = (error.errors || []).map(err => ({
        path: err.path ? err.path[0] : 'campo',
        message: err.message
      }));

      return res.status(400).json({
        status: 'error',
        message: 'Dados inválidos',
        details: details
      });
    }

    next(error);
  }
};