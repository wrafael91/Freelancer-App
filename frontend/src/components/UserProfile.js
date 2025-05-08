import React, { useEffect, useState } from 'react';
import { Modal, Box, Typography, List, ListItem, ListItemText, CircularProgress, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const UserProfile = ({ userId, open, onClose }) => {
  const [user, setUser] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId && open) {
      setLoading(true);
      // Sacar info usuario
      fetch(`${process.env.REACT_APP_API_URL}/api/users/${userId}`)
        .then(res => res.json())
        .then(data => setUser(data))
        .catch(() => setUser(null));

      // Sacar info servicios
      fetch(`${process.env.REACT_APP_API_URL}/api/services?userId=${userId}`)
        .then(res => res.json())
        .then(data => setServices(data))
        .catch(() => setServices([]))
        .finally(() => setLoading(false));
    }
  }, [userId, open]);

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="user-profile-modal">
      <Box sx={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        bgcolor: 'background.paper', boxShadow: 24, p: 4, width: { xs: '90%', sm: 400 },
        borderRadius: 2, maxHeight: '80vh', overflow: 'auto'
      }}>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>

        {loading ? (
         <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : user ? (
          <>
            <Typography variant="h5" component="h2" gutterBottom>
              Perfil de {user.name}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {user.email}
            </Typography>

            <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
              Servicios ofrecidos
            </Typography>
            
            {services.length > 0 ? (
              <List>
                {services.map(service => (
                  <ListItem 
                    key={service._id}
                    sx={{ 
                      bgcolor: 'background.default',
                      borderRadius: 1,
                      mb: 1
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1">
                          {service.title}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary">
                            {service.description}
                          </Typography>
                          <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                            ${service.price}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary">
                This user has not yet posted any services.
              </Typography>
            )}
          </>
        ) : (
          <Typography color="error">
            Failed to load user information.
          </Typography>
        )}
      </Box>
    </Modal>
  );
};

export default UserProfile;