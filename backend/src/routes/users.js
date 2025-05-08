const express = require('express');
const router = express.Router();
const User = require('../models/User'); 

// GET /api/users/:id - Obtener un usuario por ID
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password') // Excluimos la contraseña por seguridad
            .select('-__v'); // Opcional: excluir el campo de versión

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({ message: 'Error al obtener el usuario' });
    }
});

// Opcional: GET /api/users - Obtener todos los usuarios
router.get('/', async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .select('-__v');
        res.json(users);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ message: 'Error al obtener los usuarios' });
    }
});

module.exports = router;