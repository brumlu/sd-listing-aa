import { Router } from 'express';
import { makePublicUserController, makePrivateUserController } from '../factories/user_factory.js';
import auth from './middlewares/auth.js';
import checkPermission from './middlewares/checkPermission.js';
import isOwnerOrAdmin from './middlewares/isOwnerOrAdmin.js';
import { Permissions } from '../../model/constants/permissions.js';

const router = Router();

const publicUserController = makePublicUserController();
const privateUserController = makePrivateUserController();

// --- ROTAS PÚBLICAS ---
router.post('/cadastro', (req, res) => publicUserController.cadastro(req, res));
router.post('/login', (req, res) => publicUserController.login(req, res));

// --- ROTAS PRIVADAS ---

// 1. Listagem
router.get('/listar-usuarios', auth, checkPermission(Permissions.USER_READ), (req, res) => 
  privateUserController.listar(req, res)
);

// 2. Edição (Dono ou Admin)
router.patch('/atualizar-usuario/:id', auth, isOwnerOrAdmin, (req, res) => 
  privateUserController.atualizar(req, res)
);
router.patch('/atualizar-senha/:id', auth, isOwnerOrAdmin, (req, res) => 
  privateUserController.atualizarSenha(req, res)
);

// 3. Admin Tools
router.delete('/deletar-usuario/:id', auth, checkPermission(Permissions.USER_DELETE), (req, res) => 
  privateUserController.deletar(req, res)
);

// Note: O método 'alterarCargo' agora deve estar dentro do PrivateController
router.patch('/admin/alterar-privilegio/:id', auth, checkPermission(Permissions.ADMIN_ACCESS), (req, res) => 
  privateUserController.alterarCargo(req, res)
);

// 4. Interno
router.patch('/internal/setup-admin/:id', (req, res) => 
  privateUserController.setupAdmin(req, res)
);

router.delete('/deletar-minha-conta/:id', auth, isOwnerOrAdmin, (req, res) => 
  privateUserController.deletar(req, res)
);

export default router;