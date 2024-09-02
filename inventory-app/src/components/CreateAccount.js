import React, { useState } from 'react';
import axios from 'axios';
import { Container, TextField, Button, Typography, Box } from '@mui/material';

function CreateAccount() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    company_name: '',
    phone_number: ''
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    axios.post('http://localhost:5000/api/create_account', formData)
      .then((response) => {
        setMessage(response.data.message);
      })
      .catch((error) => {
        setMessage(error.response?.data.error || 'An error occurred');
      });
  };

  return (
    <Container maxWidth="sm">
      <Box mt={5}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create Account
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
          <Button variant="contained" color="primary" type="submit" fullWidth>
            Create Account
          </Button>
        </form>
        {message && <Typography color="error" mt={2}>{message}</Typography>}
      </Box>
    </Container>
  );
}

export default CreateAccount;
