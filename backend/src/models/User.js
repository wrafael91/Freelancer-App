const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    trim: true,
    lowercase: true
  },
  contraseña: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
  },
  rol: {
    type: String,
    enum: ['cliente', 'freelancer', 'admin'],
    default: 'cliente'
  },
  avatar: {
    type: String,
    default: ''
  },
  biografia: {
    type: String,
    trim: true,
    maxlength: [500, 'La biografía no puede exceder los 500 caracteres']
  },
  portafolio: [{
    type: String
  }],
  calificacion: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  autenticacion_social: {
    type: String,
    default: null
  },
  fecha_registro: {
    type: Date,
    default: Date.now
  },
  servicios_publicados: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }],
  servicios_contratados: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }]
}, {
  timestamps: true // Añade createdAt y updatedAt
});

module.exports = mongoose.model('User', userSchema);