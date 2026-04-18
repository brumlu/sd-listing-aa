import Permissions from '../../../model/constants/permissions.js'

const isOwnerOrAdmin = (req, res, next) => {
    const user = req.user;
    const { id } = req.params;

    // Se um dos dois for nulo/undefined, já barra aqui
    if (!user?.id || !id) {
        return res.status(403).json({ message: "ID não identificado." });
    }

    const isOwner = String(user.id) === String(id);
    const isAdmin = user.permissions?.includes(Permissions.ADMIN_ACCESS);

    if (isOwner || isAdmin) {
        return next();
    }

    return res.status(403).json({ message: "Acesso negado." });
};

export default isOwnerOrAdmin;