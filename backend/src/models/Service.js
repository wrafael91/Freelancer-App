const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: [true, 'El título es requerido'],
    trim: true
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción es requerida'],
    trim: true,
    maxlength: [1000, 'La descripción no puede exceder los 1000 caracteres']
  },
  categoria: {
    type: String,
    required: [true, 'La categoría es requerida'],
    trim: true
  },
  precio: {
    type: Number,
    required: [true, 'El precio es requerido'],
    min: [0, 'El precio no puede ser negativo']
  },
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  estado: {
    type: String,
    enum: ['activo', 'pausado', 'finalizado'],
    default: 'activo'
  },
  imagenes: [{
    type: String
  }],
  calificaciones: [{
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    puntuacion: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comentario: String,
    fecha: {
      type: Date,
      default: Date.now
    }
  }],
  promedio_calificacion: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true // Añade createdAt y updatedAt
});

// Middleware para calcular el promedio de calificaciones
serviceSchema.pre('save', function(next) {
  if (this.calificaciones.length > 0) {
    this.promedio_calificacion = this.calificaciones.reduce((acc, curr) => acc + curr.puntuacion, 0) / this.calificaciones.length;
  }
  next();
});

module.exports = mongoose.model('Service', serviceSchema);