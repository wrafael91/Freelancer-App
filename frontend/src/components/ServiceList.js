import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, CardActions, Button, Grid, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link } from 'react-router-dom';

const ServiceList = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Obtener la lista de servicios
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/services`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Error fetching services');
        }

        const data = await response.json();
        setServices(data);
        setLoading(false);
      } catch (err) {
        setError('Error loading services');
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Eliminar un servicio
  const handleDelete = async (serviceId) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/services/${serviceId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Error deleting service');
        }

        setServices(services.filter(service => service._id !== serviceId));
      } catch (err) {
        setError('Error deleting service');
      }
    }
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ maxWidth: 800, margin: 'auto', padding: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <Typography variant="h5">Services</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          component={Link} 
          to="/services/new"
        >
          Add New Service
        </Button>
      </Box>

      <List>
    {services.map((service) => (
      <ListItem 
        key={service._id}
        sx={{ borderBottom: '1px solid #eee' }}
      >
        <ListItemText
          primary={service.title}
          secondary={`${service.description} - $${service.price}`}
        />
        <ListItemSecondaryAction>
          <IconButton 
            component={Link} 
            to={`/services/edit/${service._id}`}
            edge="end" 
            aria-label="edit"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            onClick={() => handleDelete(service._id)}
            edge="end"
            aria-label="delete"
          >
            <DeleteIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    ))}
  </List>
    </Box>
  );
};

export default ServiceList;