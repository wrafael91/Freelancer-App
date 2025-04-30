import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { TextField, Button, Box, Typography, Paper } from '@mui/material';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Aquí va la lógica para enviar la petición al backend
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (response.ok) {
          // Guarda el token en localStorage
          localStorage.setItem('token', data.token);
          alert('¡Inicio de sesión exitoso!');
          // Redirige al chat
          window.location.href = '/';
        } else {
          alert(data.message || 'Error al iniciar sesión');
        }
      } catch (error) {
        alert('Error de red');
      }
    console.log('Login:', { email, password });
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 400, margin: 'auto', mt: 4 }}>
      <Paper elevation={3} sx={{ padding: 3 }}>
        <Typography variant="h5" align="center" mb={3}>
          Iniciar Sesión
        </Typography>
        <form onSubmit={handleSubmit}>
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
            Iniciar Sesión
          </Button>
          <Typography align="center" sx={{ mt: 2 }}>
            ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
          </Typography>
        </form>
      </Paper>
    </Box>
  );
};

export default Login;