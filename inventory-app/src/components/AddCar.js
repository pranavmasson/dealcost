import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Box, Select, MenuItem, InputLabel, FormControl, Grid } from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const formatDate = (date) => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

function AddCar() {
  const [formData, setFormData] = useState({
    vin: '',
    make: '',
    model: '',
    trim: '',
    year: '20',
    mileage: '',
    color: '',
    purchase_price: '',
    sale_price: '',
    sale_type: '',
    finance_type: 'na',
    closing_statement: '',
    sale_status: 'available',
    purchase_date: new Date(), // Initialize as Date object for DatePicker
    title_received: 'na', // New field for "Title Received?"
    pending_issues: '' // Added "Pending Issues" field
  });
  const [message, setMessage] = useState('');

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      purchase_date: date,
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const username = localStorage.getItem('username');
    if (!username || username === 'undefined') {
      setMessage('User ID is missing or invalid. Please log in again.');
      return;
    }

    const vehicleData = {
      ...formData,
      purchase_date: formatDate(formData.purchase_date), // Format the date before sending
      username,
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
    <Container maxWidth="md">
      <Box mt={5}>
        <Typography variant="h4" component="h1" gutterBottom>
          Add Car
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* Vehicle Details */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Vehicle Details</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="VIN"
                variant="outlined"
                fullWidth
                name="vin"
                value={formData.vin}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Make"
                variant="outlined"
                fullWidth
                name="make"
                value={formData.make}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Model"
                variant="outlined"
                fullWidth
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
                name="year"
                type="number"
                value={formData.year}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Mileage"
                variant="outlined"
                fullWidth
                name="mileage"
                type="number"
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
                name="color"
                value={formData.color}
                onChange={handleChange}
                required
              />
            </Grid>

            {/* Pending Issues */}
            <Grid item xs={12} sm={8}>
              <TextField
                label="Pending Issues"
                variant="outlined"
                fullWidth
                name="pending_issues"
                value={formData.pending_issues}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </Grid>

            {/* Financial Details */}
            <Grid item xs={12} mt={2}>
              <Typography variant="h6" gutterBottom>Financial Details</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Purchase Price"
                variant="outlined"
                fullWidth
                name="purchase_price"
                type="number"
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
                name="sale_price"
                type="number"
                value={formData.sale_price}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth variant="outlined">
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
                  <MenuItem value="consignment">Consignment</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="finance-type-label">Finance Type</InputLabel>
                <Select
                  labelId="finance-type-label"
                  label="Finance Type"
                  name="finance_type"
                  value={formData.finance_type}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="na">N/A</MenuItem>
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="finance">Finance</MenuItem>
                  <MenuItem value="outside finance">Outside Finance</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Title Received Dropdown */}
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="title-received-label">Title Received?</InputLabel>
                <Select
                  labelId="title-received-label"
                  label="Title Received?"
                  name="title_received"
                  value={formData.title_received}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="yes">Yes</MenuItem>
                  <MenuItem value="no">No</MenuItem>
                  <MenuItem value="na">N/A</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Purchase Date and Closing Statement */}
            <Grid item xs={12} sm={4}>
              <label>Purchase Date</label>
              <DatePicker
                selected={formData.purchase_date}
                onChange={handleDateChange}
                dateFormat="MM/dd/yyyy"
                customInput={<TextField variant="outlined" fullWidth />}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                label="Closing Statement"
                variant="outlined"
                fullWidth
                name="closing_statement"
                value={formData.closing_statement}
                onChange={handleChange}
                multiline
                rows={4}
              />
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12} mt={2}>
              <Button variant="contained" color="primary" type="submit" fullWidth>
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