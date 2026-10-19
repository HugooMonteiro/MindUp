const jwt = require('jsonwebtoken');

// Confere o token JWT enviado no cabeçalho "Authorization: Bearer <token>"
// e guarda o id do usuário em req.userId. Todas as rotas protegidas usam esse id,
// nunca o que vem na URL ou no corpo da requisição.
module.exports = function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const [tipo, token] = header.split(' ');

  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Faça login para continuar.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = String(payload.userId);
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Sessão expirada. Faça login novamente.' });
  }
};
