import React, { useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode';
import io from 'socket.io-client';
import { TextField, Button, List, ListItem, ListItemText, Box, Paper, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Chat = () => {

  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

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
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  let typingTimeout = null;

  useEffect(() => {
    // Crear la conexión
    const newSocket = io(process.env.REACT_APP_API_URL, {
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

    //lista de usuarios conectados
    newSocket.on('users list', (usersList) => {
      setUsers(usersList);
    });

    // Detectar cuando otro usuario está escribiendo
    newSocket.on('typing', (user) => {
      setTypingUsers(prev => {
        if (!prev.includes(user)) {
          return [...prev, user];
        }
        return prev;
      });
    });

    // Detectar cuando otro usuario deja de escribir
    newSocket.on('stop typing', (user) => {
      setTypingUsers(prev => prev.filter(u => u !== user));
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
    if (socket && isConnected) {
      socket.emit('typing');
      if (typingTimeout) clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        socket.emit('stop typing');
      }, 1000); // 1 segundo sin escribir
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim() !== '' && socket && isConnected) {
      socket.emit('chat message', newMessage);
      socket.emit('stop typing');
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
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="outlined" color="error" onClick={handleSignOut}>
          Sign out
        </Button>
      </Box>
      <Paper elevation={1} sx={{ padding: 1, marginBottom: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Connected users ({users.length}):
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {users.map((user, idx) => (
            <Typography 
              key={idx} 
              variant="body2" 
              sx={{ 
                backgroundColor: user === username ? '#90caf9' : '#e0e0e0', 
                borderRadius: 1, 
                px: 1, 
                py: 0.5 
              }}
            >
              {user}
            </Typography>
          ))}
        </Box>
      </Paper>
      <Paper elevation={3} sx={{ padding: 2 }}>
        <Typography variant="h5" gutterBottom>
          Chat
        </Typography>
        <Box sx={{ marginBottom: 2 }}>
          <Typography variant="body2">
            Status: {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
          </Typography>
          <Typography variant="body2">
            User: {username}
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
            label="Message"
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
            Send
          </Button>
        </Box>
      </Paper>
      {typingUsers.length > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
          {typingUsers.join(', ')} {typingUsers.length === 1 ? 'está escribiendo...' : 'están escribiendo...'}
        </Typography>
      )}
    </Box>
  );
};

export default Chat;