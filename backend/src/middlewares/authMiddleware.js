const jwt = require('jsonwebtoken');

// Middleware para verificar el token JWT
module.exports = function(req, res, next) {
  // Obtiene el token del header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // Verifica si no hay token
  if (!token) {
    return res.status(401).json({ message: 'No hay token, autorización denegada' });
  }

  // Verifica el token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Asigna el usuario del token al objeto request
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token no válido' });
  }
};