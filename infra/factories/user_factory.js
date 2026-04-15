import { UserRepository } from '../../repository/user_repository.js';
import { HashProvider } from '../../infra/providers/hash_provider.js';
import { TokenProvider } from '../../infra/providers/token_provider.js';
import { 
  CreateUser, 
  LoginUser, 
  ListUsers, 
  UpdateUser, 
  UpdateUserPassword, 
  DeleteUser, 
  ChangeUserRole 
} from '../../usecase/user_usecase.js';
import { PublicUserController } from '../../infra/http/controller/public_user_controller.js';
import { PrivateUserController } from '../../infra/http/controller/private_user_controller.js';

export const makePublicUserController = () => {
  const userRepository = new UserRepository();
  const hashProvider = new HashProvider();
  const tokenProvider = new TokenProvider();

  const createUserUseCase = new CreateUser(userRepository, hashProvider);
  const loginUserUseCase = new LoginUser(userRepository, hashProvider, tokenProvider);

  return new PublicUserController(createUserUseCase, loginUserUseCase);
};

export const makePrivateUserController = () => {
  const userRepository = new UserRepository();
  const hashProvider = new HashProvider(); // Caso precise para trocar senha

  const useCases = {
    listUsers: new ListUsers(userRepository),
    updateUser: new UpdateUser(userRepository),
    updatePassword: new UpdateUserPassword(userRepository, hashProvider),
    deleteUser: new DeleteUser(userRepository),
    changeRole: new ChangeUserRole(userRepository)
  };

  return new PrivateUserController(useCases);
};