const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
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
  password: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
  },
  role: {
    type: String,
    enum: ['client', 'freelancer', 'admin'],
    default: 'client'
  },
  avatar: {
    type: String,
    default: ''
  },
  biography: {
    type: String,
    trim: true,
    maxlength: [500, 'La biografía no puede exceder los 500 caracteres']
  },
  portfolio: [{
    type: String
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  socialAuth: {
    type: String,
    default: null
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  publishedServices: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }],
  hiredServices: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);