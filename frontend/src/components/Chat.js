import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const Chat = () => {
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
    });

    newSocket.on('disconnect', () => {
      console.log('Desconectado del servidor');
      setIsConnected(false);
    });

    // Eventos de mensajes
    newSocket.on('chat message', (msg) => {
      setMessages(prevMessages => [...prevMessages, msg]);
    });

    // Guardar el socket en el estado
    setSocket(newSocket);

    // Limpiar al desmontar
    return () => {
      newSocket.close();
    };
  }, []); // Solo se ejecuta una vez al montar el componente

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
    <div>
      <h2>Chat en tiempo real</h2>
      <div style={{ marginBottom: '10px' }}>
        Estado: {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
      </div>
      <div style={{ 
        height: '300px', 
        overflowY: 'auto',
        border: '1px solid #ccc',
        padding: '10px',
        marginBottom: '10px'
      }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ marginBottom: '5px' }}>{msg}</div>
        ))}
      </div>
      <div>
        <input
          type="text"
          value={newMessage}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          style={{ marginRight: '10px' }}
          disabled={!isConnected}
        />
        <button 
          onClick={handleSendMessage}
          disabled={!isConnected}
        >
          Enviar
        </button>
      </div>
    </div>
  );
};

export default Chat;