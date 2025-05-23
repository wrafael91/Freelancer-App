import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

const ServiceForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '', // Agregado category al estado inicial
    price: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      const fetchService = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/services/${id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (!response.ok) {
            throw new Error('Error loading service');
          }

          const data = await response.json();
          setFormData({
            title: data.title || '',
            description: data.description || '',
            category: data.category || '',
            price: data.price || ''
          });
        } catch (err) {
          setError('Error loading service');
        }
      };

      fetchService();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      
      // Validar que todos los campos requeridos estén llenos
      if (!formData.title || !formData.description || !formData.category || !formData.price) {
        throw new Error('All fields are required');
      }

      // Asegurarse de que el precio sea un número
      const serviceData = {
        ...formData,
        price: Number(formData.price)
      };

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/services${id ? `/${id}` : ''}`,
        {
          method: id ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(serviceData)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error saving service');
      }

      // Si todo sale bien, navegar a la lista de servicios
      navigate('/services');
    } catch (err) {
      setError(err.message || 'Error saving service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Paper elevation={3} sx={{ padding: 3, maxWidth: 600, margin: 'auto' }}>
        <Typography variant="h5" gutterBottom>
          {id ? 'Edit service' : 'Create new service'}
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            name="title"
            label="Title"
            value={formData.title}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
          />

          <TextField
            name="description"
            label="Description"
            value={formData.description}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
            multiline
            rows={4}
          />

          <TextField
            name="category"
            label="Category"
            value={formData.category}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
          />

          <FormControl fullWidth margin="normal">
            <InputLabel htmlFor="price">Price</InputLabel>
            <OutlinedInput
              id="price"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              startAdornment={<InputAdornment position="start">$</InputAdornment>}
              label="Price"
              required
            />
          </FormControl>

          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save service'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/services')}
            >
              Cancel
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default ServiceForm;