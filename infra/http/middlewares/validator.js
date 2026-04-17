import { ZodError } from 'zod';

export const validate = (schema) => (req, res, next) => {
  try {
    // Tenta validar o body. O parse() retorna o objeto limpo ou lança erro.
    schema.parse(req.body);
    next(); // Passou na triagem! Vai para o Controller.
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        status: 'error',
        message: 'Dados inválidos',
        // Mapeia os erros para ficarem amigáveis para o Front-end
        details: error.errors.map(err => ({
          path: err.path[0],
          message: err.message
        }))
      });
    }
    return res.status(500).json({ message: 'Erro interno no servidor' });
  }
};