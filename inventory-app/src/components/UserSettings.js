import React, { useState, useEffect } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  Paper,
  Grid,
  Switch,
  styled,
} from '@mui/material';
import { motion } from 'framer-motion';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

const ThemeSwitch = styled(Switch)(({ theme }) => ({
  width: 62,
  height: 34,
  padding: 7,
  '& .MuiSwitch-switchBase': {
    margin: 1,
    padding: 0,
    transform: 'translateX(6px)',
    '&.Mui-checked': {
      color: '#fff',
      transform: 'translateX(22px)',
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
      },
    },
  },
  '& .MuiSwitch-thumb': {
    backgroundColor: theme.palette.mode === 'dark' ? '#003892' : '#001e3c',
    width: 32,
    height: 32,
  },
  '& .MuiSwitch-track': {
    opacity: 1,
    backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
    borderRadius: 20 / 2,
  },
}));

function UserSettings({ isDarkMode, onThemeChange }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    company_name: '',
    phone_number: '',
    password: '',
    street_address: '',
    city: '',
    state: '',
    zip_code: '',
    country: '',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchUserDetails = async () => {
      const userId = localStorage.getItem('userToken');
      if (userId) {
        try {
          const response = await fetch(`http://127.0.0.1:5000/api/user/${userId}`);
          const data = await response.json();
          console.log('Response from server:', data);
          
          if (response.ok) {
            setFormData({
              username: data.username,
              email: data.email,
              company_name: data.company_name,
              phone_number: data.phone_number || '',
              street_address: data.address?.street || '',
              city: data.address?.city || '',
              state: data.address?.state || '',
              zip_code: data.address?.zip_code || '',
              country: data.address?.country || ''
            });
          } else {
            setMessage('Failed to load user details');
            console.error('Server error:', data.error);
          }
        } catch (error) {
          setMessage('Error fetching user details');
          console.error('Fetch error:', error);
        }
      }
    };

    fetchUserDetails();
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem('userToken');
    console.log('Current userToken in localStorage:', userId);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('userToken');
    console.log('Attempting to update user with ID:', userId);

    if (!userId) {
        setMessage('User not found. Please log in again.');
        return;
    }

    const updateData = {
        username: formData.username,
        email: formData.email,
        company_name: formData.company_name,
        phone_number: formData.phone_number,
        street_address: formData.street_address,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zip_code,
        country: formData.country
    };

    console.log('Sending update data:', updateData);  // Debug log

    try {
        const response = await fetch(`http://127.0.0.1:5000/api/user/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData),
        });

        const data = await response.json();
        console.log('Server response:', data);

        if (!response.ok) {
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }

        setMessage('Changes were saved successfully!');
        
        if (formData.company_name !== localStorage.getItem('company_name')) {
            localStorage.setItem('company_name', formData.company_name);
        }
    } catch (error) {
        console.error('Error updating user:', error);
        setMessage(`Error updating user: ${error.message}`);
    }
  };

  // Animation variants for Framer Motion
  const containerVariant = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };

  const buttonVariant = {
    hover: {
      scale: 1.05,
      boxShadow: '0px 0px 10px rgba(0, 0, 255, 0.5)',
      transition: { duration: 0.3 },
    },
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 3,
              background: theme => theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Typography variant="h5" gutterBottom sx={{ 
              mb: 4,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 'bold'
            }}>
              User Settings
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    label="Username"
                    variant="outlined"
                    fullWidth
                    margin="dense"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Email"
                    variant="outlined"
                    fullWidth
                    margin="dense"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Company Name"
                    variant="outlined"
                    fullWidth
                    margin="dense"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Phone Number"
                    variant="outlined"
                    fullWidth
                    margin="dense"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Address"
                    variant="outlined"
                    fullWidth
                    margin="dense"
                    name="street_address"
                    value={formData.street_address}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="City"
                    variant="outlined"
                    fullWidth
                    margin="dense"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="State"
                    variant="outlined"
                    fullWidth
                    margin="dense"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="ZIP Code"
                    variant="outlined"
                    fullWidth
                    margin="dense"
                    name="zip_code"
                    value={formData.zip_code}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Country"
                    variant="outlined"
                    fullWidth
                    margin="dense"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mt: 2,
                    p: 2,
                    borderRadius: 2,
                    background: theme => theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(33, 150, 243, 0.05)',
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <LightModeIcon sx={{ color: '#FDB813' }} />
                      <ThemeSwitch checked={isDarkMode} onChange={onThemeChange} />
                      <DarkModeIcon sx={{ color: '#7982B9' }} />
                    </Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="submit"
                      fullWidth
                      sx={{
                        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                        color: 'white',
                        fontWeight: 'bold',
                        padding: '15px',
                        fontSize: '1.1rem',
                        borderRadius: '12px',
                        textTransform: 'none',
                        boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #2196F3 60%, #21CBF3 90%)',
                        },
                      }}
                    >
                      Save Changes
                    </Button>
                  </motion.div>
                </Grid>
              </Grid>
            </Box>

            {message && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Box mt={3}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      background: 'rgba(33, 150, 243, 0.1)',
                      border: '1px solid rgba(33, 150, 243, 0.2)',
                    }}
                  >
                    <Typography textAlign="center" color="primary">
                      {message}
                    </Typography>
                  </Paper>
                </Box>
              </motion.div>
            )}
          </Paper>
        </motion.div>
      </Box>
    </Container>
  );
}

export default UserSettings;