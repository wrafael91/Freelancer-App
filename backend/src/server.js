const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http'); // Importa el módulo http
const { Server } = require("socket.io"); // Importa Socket.IO

// Importa las rutas de autenticación
const authRoutes = require('./routes/authRoutes'); 
const serviceRoutes = require('./routes/serviceRoutes');

dotenv.config();

const app = express();

// Crea el servidor HTTP
const server = http.createServer(app);

// Inicializa Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ["GET", "POST"]
  }
});

// Middleware para parsear JSON
app.use(express.json());

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));


// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('Conectado a MongoDB Atlas'))
.catch(err => console.error('Error de conexión:', err));

// Usa las rutas de autenticación
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/users', require('./routes/users'));

let connectedUsers = [];

// Configuración de Socket.IO
io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);

  // Cuando un usuario se une al chat
  socket.on('join chat', (userData) => {
    // Guardamos tanto el username como el userId en el socket
    socket.username = userData.username;
    socket.userId = userData.userId;

    // Agregamos el usuario si no está ya en la lista
    const existingUser = connectedUsers.find(user => user.userId === userData.userId);
    if (!existingUser) {
      connectedUsers.push({
        username: userData.username,
        userId: userData.userId
      });
    }

    // Emite la lista actualizada a todos
    io.emit('users list', connectedUsers);

    socket.broadcast.emit('system message', {
      text: `${userData.username} has joined the chat`,
      timestamp: new Date().toLocaleTimeString()
    });
    console.log(`${userData.username} has joined the chat`);
  });

  socket.on('disconnect', () => {
    if (socket.username) {
      // Eliminar usuario de la lista de conectados
      connectedUsers = connectedUsers.filter(user => user.userId !== socket.userId);
      
      // Emitir lista actualizada
      io.emit('users list', connectedUsers);

      // Mensaje de sistema para todos menos el que se desconecta
      socket.broadcast.emit('system message', {
        text: `${socket.username} left the chat`,
        timestamp: new Date().toLocaleTimeString()
      });
    }
    console.log('Usuario desconectado:', socket.username || socket.id);
  });

  socket.on('chat message', (msg) => {
    const messageData = {
      text: msg,
      username: socket.username || 'Anónimo',
      userId: socket.userId, // Incluimos el userId en los mensajes
      timestamp: new Date().toLocaleTimeString()
    };
    
    console.log('Mensaje recibido:', messageData);
    io.emit('chat message', messageData);
  });

  // Un usuario está escribiendo
  socket.on('typing', () => {
    socket.broadcast.emit('typing', socket.username);
  });

  // Un usuario deja de escribir
  socket.on('stop typing', () => {
    socket.broadcast.emit('stop typing', socket.username);
  });
});



// Define el puerto
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});