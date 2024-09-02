import React, { useState } from 'react';
import axios from 'axios';
import { Container, TextField, Button, Typography, Box } from '@mui/material';

function AddCar() {
  const [formData, setFormData] = useState({
    user_id: '',
    item_name: '',
    item_description: '',
    quantity: 1,
    price: 0
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

    axios.post('http://localhost:5000/api/insert_vehicle', formData)
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
          Add Car
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="User ID"
            variant="outlined"
            fullWidth
            margin="normal"
            name="user_id"
            value={formData.user_id}
            onChange={handleChange}
            required
          />
          <TextField
            label="Vehicle Name"
            variant="outlined"
            fullWidth
            margin="normal"
            name="item_name"
            value={formData.item_name}
            onChange={handleChange}
            required
          />
          <TextField
            label="Description"
            variant="outlined"
            fullWidth
            margin="normal"
            name="item_description"
            value={formData.item_description}
            onChange={handleChange}
            required
          />
          <TextField
            label="Quantity"
            variant="outlined"
            type="number"
            fullWidth
            margin="normal"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            required
          />
          <TextField
            label="Price"
            variant="outlined"
            type="number"
            fullWidth
            margin="normal"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
          />
          <Button variant="contained" color="primary" type="submit" fullWidth>
            Add Car
          </Button>
        </form>
        {message && <Typography color="error" mt={2}>{message}</Typography>}
      </Box>
    </Container>
  );
}

export default AddCar;
