import React, { useState } from 'react';
import axios from 'axios';
import { Container, TextField, Button, Typography, Box } from '@mui/material';

function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    axios.post('http://localhost:5000/api/login', formData)
      .then((response) => {
        setMessage(response.data.message);
        // Redirect or handle successful login here
      })
      .catch((error) => {
        setMessage(error.response?.data.error || 'An error occurred');
      });
  };

  return (
    <Container maxWidth="sm">
      <Box mt={5}>
        <Typography variant="h4" component="h1" gutterBottom>
          Login
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
          <Button variant="contained" color="primary" type="submit" fullWidth>
            Login
          </Button>
        </form>
        {message && <Typography color="error" mt={2}>{message}</Typography>}
      </Box>
    </Container>
  );
}

export default Login;
