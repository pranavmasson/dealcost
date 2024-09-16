import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Box } from '@mui/material';

function AddCar() {
  const [formData, setFormData] = useState({
    vin: '0',
    make: '',
    model: '',
    trim: '',
    year: '0000',
    mileage: '0',
    color: '',
    purchase_price: '0',
    sale_price: '0',
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

    const username = localStorage.getItem('username'); // Retrieve the username from local storage

    console.log('Retrieved username from local storage:', username); // Debugging log

    if (!username || username === 'undefined') {
      setMessage('User ID is missing or invalid. Please log in again.');
      return;
    }

    const vehicleData = {
      vin: formData.vin,
      make: formData.make,
      model: formData.model,
      trim: formData.trim,
      year: formData.year,
      mileage: formData.mileage,
      color: formData.color,
      purchase_price: formData.purchase_price,
      sale_price: formData.sale_price,
      username: username, // Include username in the payload
    };

    console.log('Sending vehicle data:', vehicleData); // Debugging log

    fetch('http://127.0.0.1:5000/api/insert_vehicle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(vehicleData),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => {
            throw new Error(data.error || 'Failed to add vehicle');
          });
        }
        return response.json();
      })
      .then((data) => {
        setMessage('Vehicle added successfully!');
      })
      .catch((error) => {
        console.error('Error:', error);
        setMessage(error.message || 'An error occurred');
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
            label="VIN"
            variant="outlined"
            fullWidth
            margin="normal"
            name="vin"
            value={formData.vin}
            onChange={handleChange}
            required
          />
          <TextField
            label="Make"
            variant="outlined"
            fullWidth
            margin="normal"
            name="make"
            value={formData.make}
            onChange={handleChange}
            required
          />
          <TextField
            label="Model"
            variant="outlined"
            fullWidth
            margin="normal"
            name="model"
            value={formData.model}
            onChange={handleChange}
            required
          />
          <TextField
            label="Trim"
            variant="outlined"
            fullWidth
            margin="normal"
            name="trim"
            value={formData.trim}
            onChange={handleChange}
          />
          <TextField
            label="Year"
            variant="outlined"
            fullWidth
            margin="normal"
            name="year"
            value={formData.year}
            onChange={handleChange}
            type="number"
            required
          />
          <TextField
            label="Mileage"
            variant="outlined"
            fullWidth
            margin="normal"
            type="number"
            name="mileage"
            value={formData.mileage}
            onChange={handleChange}
            required
          />
          <TextField
            label="Color"
            variant="outlined"
            fullWidth
            margin="normal"
            name="color"
            value={formData.color}
            onChange={handleChange}
            required
          />
          <TextField
            label="Purchase Price"
            variant="outlined"
            fullWidth
            margin="normal"
            type="number"
            name="purchase_price"
            value={formData.purchase_price}
            onChange={handleChange}
            required
          />
          <TextField
            label="Sale Price"
            variant="outlined"
            fullWidth
            margin="normal"
            type="number"
            name="sale_price"
            value={formData.sale_price}
            onChange={handleChange}
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