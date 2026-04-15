import { Router } from 'express';
import { PublicUserController } from './controller/public_user_controller.js';
import { CreateUser, LoginUser } from '../../../usecase/user_usecase.js';
import { UserRepository } from '../../../repository/user_repository.js';
// import { authMiddleware } from '../middlewares/auth.js'; // Descomente quando criar o middleware

const router = Router();

// --- INJEÇÃO DE DEPENDÊNCIAS ---
// 1. O Repositório (Acesso ao Banco)
const userRepository = new UserRepository();

// 2. Os Casos de Uso (Regras de Negócio)
const createUserUseCase = new CreateUser(userRepository);
const loginUserUseCase = new LoginUser(userRepository);

// 3. O Controller (Entrada e Saída HTTP)
// Passamos os dois casos de uso para o construtor do controller
const publicUserController = new PublicUserController(createUserUseCase, loginUserUseCase);

// --- DEFINIÇÃO DAS ROTAS ---

// Rotas Públicas (Abertas)
router.post('/cadastro', (req, res) => publicUserController.cadastro(req, res));
router.post('/login', (req, res) => publicUserController.login(req, res));

// Exemplo de Rota Privada (Futura)
// router.get('/perfil', authMiddleware, (req, res) => privateController.getProfile(req, res));

export default router;