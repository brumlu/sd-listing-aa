import Permissions from '../../../model/constants/permissions.js';

const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    const userPermissions = req.user?.permissions;

    if (!userPermissions) {
      return res.status(403).json({ 
        message: "Acesso negado: Nenhuma permissão encontrada." 
      });
    }

    const isSuperUser = userPermissions.includes(Permissions.ADMIN_ACCESS);
    const hasSpecificPermission = userPermissions.includes(requiredPermission);

    if (isSuperUser || hasSpecificPermission) {
      return next(); // Acesso liberado
    }

    return res.status(403).json({ 
      message: `Acesso negado: Requer privilégio ${requiredPermission}.` 
    });
  };
};

export default checkPermission;