const express = require('express');
const router = express.Router();
const {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService
} = require('../controllers/serviceController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rutas públicas
router.get('/', getServices); // Obtener todos los servicios
router.get('/:id', getServiceById); // Obtener un servicio por ID

// Rutas protegidas (requieren autenticación)
router.post('/', authMiddleware, createService); // Crear un servicio
router.put('/:id', authMiddleware, updateService); // Actualizar un servicio
router.delete('/:id', authMiddleware, deleteService); // Eliminar un servicio

module.exports = router;