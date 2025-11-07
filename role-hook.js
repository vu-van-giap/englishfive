// backend/role-hook.js
function authorizeRole(roles = []) {
  return async (req, reply) => {
    if (!req.user) {
      return reply.code(401).send({ message: 'Chưa đăng nhập' });
    }

    if (!roles.includes(req.user.role)) {
      return reply.code(403).send({ message: 'Không có quyền truy cập' });
    }
  };
}

module.exports = authorizeRole;
