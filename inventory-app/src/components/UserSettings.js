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
} from '@mui/material';
import { motion } from 'framer-motion'; // Importing Framer Motion for animations

function UserSettings() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    company_name: '',
    phone_number: '',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchUserDetails = async () => {
      const userId = localStorage.getItem('userToken');
      if (userId) {
        try {
          const response = await fetch(`http://127.0.0.1:5000/api/user/${userId}`);
          const data = await response.json();
          if (response.ok) {
            setFormData({
              username: data.username,
              email: data.email,
              company_name: data.company_name,
              phone_number: data.phone_number || '',
            });
          } else {
            setMessage('Failed to load user details');
          }
        } catch (error) {
          setMessage('Error fetching user details');
          console.error('Error:', error);
        }
      }
    };

    fetchUserDetails();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('userToken'); // Get userId from localStorage

    if (userId) {
      try {
        const response = await fetch(`http://127.0.0.1:5000/api/user/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData), // Assuming formData has the updated user data
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setMessage('Changes were saved successfully!');
        console.log(data.message); // Check for the success message from the server
      } catch (error) {
        setMessage('Error updating user');
        console.error('Error updating user:', error);
      }
    } else {
      console.error('User ID is not available in local storage');
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
    <Container maxWidth="sm">
      <motion.div
        variants={containerVariant}
        initial="hidden"
        animate="visible"
      >
        <Paper
          elevation={4}
          sx={{
            padding: 4,
            mt: 5,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #f3f4f6, #ffffff)',
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            textAlign="center"
            fontWeight="bold"
            color="black"
            sx={{
              fontFamily: 'Roboto, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: 2,
            }}
          >
            User Settings
          </Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
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
            </Grid>
            <Box mt={3} textAlign="center">
              <motion.div variants={buttonVariant} whileHover="hover">
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  type="submit"
                  sx={{
                    padding: '10px 20px',
                    fontSize: '16px',
                    borderRadius: 2,
                    textTransform: 'none',
                  }}
                >
                  Save Changes
                </Button>
              </motion.div>
            </Box>
          </Box>

          {message && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Box mt={4}>
                <Card sx={{ backgroundColor: '#e3f2fd' }}>
                  <CardContent>
                    <Typography
                      variant="h6"
                      color="primary"
                      textAlign="center"
                      sx={{ fontWeight: 'bold' }}
                    >
                      {message}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </motion.div>
          )}
        </Paper>
      </motion.div>
    </Container>
  );
}

export default UserSettings;