import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Box, Checkbox, FormControlLabel } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

function Login({ onLogin }) {
  const [formData, setFormData] = useState({ username: '', password: '', rememberMe: false });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch('${process.env.REACT_APP_API_URL}/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          setMessage(data.error);
        } else {
          setMessage(data.message);
          localStorage.setItem('userToken', data.user_id);
          localStorage.setItem('username', data.user_id);
          localStorage.setItem('company_name', data.company_name);

          onLogin(data.user_id);
          navigate('/home');
        }
      })
      .catch((error) => {
        setMessage('An error occurred');
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

        {/* Right Section with Login Form */}
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
            Login to <span style={{ color: '#0056b3' }}>DEALCOST</span>
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
            <FormControlLabel
              control={
                <Checkbox
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
              }
              label="Remember me"
            />
            <Button variant="contained" color="primary" type="submit" fullWidth sx={{ mt: 2 }}>
              Login
            </Button>
            {message && (
              <Typography color="error" mt={2} align="center">
                {message}
              </Typography>
            )}
          </form>
          <Box display="flex" justifyContent="space-between" mt={2}>
            <Typography variant="body2" color="textSecondary" sx={{ cursor: 'pointer' }}>
              Forgot Password
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ cursor: 'pointer' }}>
              Forgot Username
            </Typography>
          </Box>
        </Box>
      </Container>
    </motion.div>
  );
}

export default Login;