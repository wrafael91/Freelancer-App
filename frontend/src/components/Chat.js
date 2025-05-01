import React, { useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode';
import io from 'socket.io-client';
import { TextField, Button, List, ListItem, ListItemText, Box, Paper, Typography } from '@mui/material';

const Chat = () => {

  const token = localStorage.getItem('token');
  let username = 'Anónimo';
  if (token) {
    try {
      const decoded = jwtDecode(token);
      username = decoded.user.name || 'Anónimo';
    } catch (e) {
      // Si el token no es válido, mantenemos 'Anónimo'
    }
  }

  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Crear la conexión
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket']
    });

    // Eventos de conexión
    newSocket.on('connect', () => {
      console.log('Conectado al servidor');
      setIsConnected(true);
      newSocket.emit('join chat', username); // Enviamos el nombre de usuario al servidor
    });

    newSocket.on('disconnect', () => {
      console.log('Desconectado del servidor');
      setIsConnected(false);
    });

    // Eventos de mensajes
    newSocket.on('chat message', (messageData) => {
      setMessages(prevMessages => [...prevMessages, {...messageData, type: 'user'}]);
    });

    newSocket.on('system message', (messageData) => {
      setMessages(prevMessages => [...prevMessages, {...messageData, type: 'system'}]);
    });

    // Guardar el socket en el estado
    setSocket(newSocket);

    // Limpiar al desmontar
    return () => {
      newSocket.close();
    };
  }, [username]); // Solo se ejecuta una vez al montar el componente

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
  };

  const handleSendMessage = () => {
    if (newMessage.trim() !== '' && socket && isConnected) {
      socket.emit('chat message', newMessage);
      setNewMessage('');
    }
  };

  // Manejar envío con Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 600, bgcolor: 'background.paper', margin: 'auto', padding: 2 }}>
      <Paper elevation={3} sx={{ padding: 2 }}>
        <Typography variant="h5" gutterBottom>
          Chat en tiempo real
        </Typography>
        <Box sx={{ marginBottom: 2 }}>
          <Typography variant="body2">
            Estado: {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
          </Typography>
          <Typography variant="body2">
            Usuario: {username}
          </Typography>
        </Box>
        <Paper sx={{ 
          height: 400, 
          overflow: 'auto', 
          backgroundColor: '#f5f5f5',
          marginBottom: 2,
          padding: 2
        }}>
          <List>
            {messages.map((msg, index) => (
              msg.type === 'system' ? (
                <ListItem key={index} sx={{ justifyContent: 'center' }}>
                  <ListItemText
                    primary={
                      <Typography variant="caption" color="text.secondary" align="center">
                        {msg.text} ({msg.timestamp})
                      </Typography>
                    }
                  />
                </ListItem>
              ) : (
                <ListItem 
                  key={index}
                  sx={{
                    backgroundColor: msg.username === username ? '#e3f2fd' : 'white',
                    borderRadius: 1,
                    marginBottom: 1,
                    padding: 1
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="body1">
                        {msg.text}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption">
                        {msg.username} - {msg.timestamp}
                      </Typography>
                    }
                  />
                </ListItem>
              )
            ))}
          </List>
        </Paper>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            label="Mensaje"
            variant="outlined"
            size="small"
            fullWidth
            value={newMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            disabled={!isConnected}
          />
          <Button 
            variant="contained" 
            onClick={handleSendMessage} 
            disabled={!isConnected}
          >
            Enviar
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Chat;