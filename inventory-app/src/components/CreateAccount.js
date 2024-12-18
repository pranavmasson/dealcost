import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';

function CreateAccount() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    company_name: '',
    phone_number: '',
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch('http://127.0.0.1:5000/api/create_account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((err) => {
            throw err;
          });
        }
        return response.json();
      })
      .then((data) => {
        setMessage(data.message); // Show success message
      })
      .catch((error) => {
        if (error.error) {
          setMessage(error.error); // Show specific error message from the server
        } else {
          setMessage('An unexpected error occurred. Please try again.'); // Generic error message
        }
        console.error('Error:', error);
      });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        display: 'flex',
        height: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(to right, #003973, #E5E5BE)',
      }}
    >
      <Container
        maxWidth="md"
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          bgcolor: 'white',
          boxShadow: 3,
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        {/* Left Section with Image */}
        <Box
          sx={{
            flex: 1,
            display: { xs: 'none', md: 'block' },
            backgroundImage: 'url("/path-to-your-image.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        ></Box>

        {/* Right Section with Create Account Form */}
        <Box
          sx={{
            flex: 1,
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <Typography variant="h4" gutterBottom align="center" fontWeight="bold">
            Create an <span style={{ color: '#0056b3' }}>Account</span>
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Username"
              variant="outlined"
              fullWidth
              margin="normal"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
            <TextField
              label="Password"
              variant="outlined"
              type="password"
              fullWidth
              margin="normal"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              margin="normal"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <TextField
              label="Company Name"
              variant="outlined"
              fullWidth
              margin="normal"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              required
            />
            <TextField
              label="Phone Number"
              variant="outlined"
              fullWidth
              margin="normal"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
            />
            <Button variant="contained" color="primary" type="submit" fullWidth sx={{ mt: 2 }}>
              Create Account
            </Button>
            {message && (
              <Typography color={message.includes('success') ? 'green' : 'red'} mt={2} align="center">
                {message}
              </Typography>
            )}
          </form>
        </Box>
      </Container>
    </motion.div>
  );
}

export default CreateAccount;