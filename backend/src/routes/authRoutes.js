const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware'); // Importa el middleware

const User = require('../models/User'); // Importa el modelo User

router.post('/register', register);
router.post('/login', login);

router.get('/user', authMiddleware, async (req, res) => {
    try {
      // req.user contiene el ID del usuario gracias al middleware
      const user = await User.findById(req.user.id).select('-password'); // Excluye la contraseña
      res.json(user);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Error del servidor');
    }
  });

module.exports = router;