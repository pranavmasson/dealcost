import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Box, Select, MenuItem, InputLabel, FormControl, Grid } from '@mui/material';

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
    sale_type: 'floor', // Default value for sale type
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

    if (!username || username === 'undefined') {
      setMessage('User ID is missing or invalid. Please log in again.');
      return;
    }

    const vehicleData = {
      ...formData, // Spread formData to include all fields
      username, // Include username in the payload
    };

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
    <Container maxWidth="md"> {/* Changed to 'md' for a wider container */}
      <Box mt={5}>
        <Typography variant="h4" component="h1" gutterBottom>
          Add Car
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}> {/* First Column */}
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
            </Grid>

            <Grid item xs={12} sm={4}> {/* Second Column */}
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
            </Grid>

            <Grid item xs={12} sm={4}> {/* Third Column */}
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
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="Trim"
                variant="outlined"
                fullWidth
                margin="normal"
                name="trim"
                value={formData.trim}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
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
            </Grid>

            <Grid item xs={12} sm={4}>
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
            </Grid>

            <Grid item xs={12} sm={4}>
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
            </Grid>

            <Grid item xs={12} sm={4}>
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
            </Grid>

            <Grid item xs={12} sm={4}>
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
            </Grid>

            {/* Dropdown for Sale Type */}
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth margin="normal" variant="outlined">
                <InputLabel id="sale-type-label">Sale Type</InputLabel>
                <Select
                  labelId="sale-type-label"
                  label="Sale Type"
                  name="sale_type"
                  value={formData.sale_type}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="floor">Floor</MenuItem>
                  <MenuItem value="dealer">Dealer</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}> {/* Submit Button */}
              <Button variant="contained" color="primary" type="submit" fullWidth sx={{ mt: 2 }}>
                Add Car
              </Button>
            </Grid>
          </Grid>
        </form>
        {message && <Typography color="error" mt={2}>{message}</Typography>}
      </Box>
    </Container>
  );
}

export default AddCar;