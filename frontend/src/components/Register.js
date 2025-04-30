import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { TextField, Button, Box, Typography, Paper } from '@mui/material';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Aquí va la lógica para enviar la petición al backend
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password }),
        });
        const data = await response.json();
        if (response.ok) {
          alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
          window.location.href = '/login';
        } else {
          alert(data.message || 'Error al registrarse');
        }
      } catch (error) {
        alert('Error de red');
      }
    console.log('Register:', { username, email, password });
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 400, margin: 'auto', mt: 4 }}>
      <Paper elevation={3} sx={{ padding: 3 }}>
        <Typography variant="h5" align="center" mb={3}>
          Registrarse
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Nombre de Usuario"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <TextField
            label="Correo Electrónico"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            label="Contraseña"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 3 }}
          >
            Registrarse
          </Button>
          <Typography align="center" sx={{ mt: 2 }}>
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
          </Typography>
        </form>
      </Paper>
    </Box>
  );
};

export default Register;