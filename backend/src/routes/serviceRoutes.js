const express = require('express');
const router = express.Router();
const {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getMyServices // Añadir este nuevo controlador
} = require('../controllers/serviceController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rutas públicas
router.get('/', getServices); // GET /api/services o /api/services?userId=123
router.get('/:id', getServiceById); // Obtener un servicio por ID

// Rutas protegidas (requieren autenticación)
router.get('/my-services', authMiddleware, getMyServices); // Nueva ruta para obtener servicios propios
router.post('/', authMiddleware, createService); // Crear un servicio
router.put('/:id', authMiddleware, updateService); // Actualizar un servicio
router.delete('/:id', authMiddleware, deleteService); // Eliminar un servicio

module.exports = router;