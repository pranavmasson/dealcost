import React, { useState } from 'react';
import { Container, TextField, Button, MenuItem, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function EnterDetailsManually() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    vin: '',
    category: '',
    notes: '',
    cost: '',
    date_occurred: '',
    location: '',
    phone_number: '',
    address: '',
    comments: ''
  });

  const categories = [
    'Sales Tax & DMV tag and Title',
    'Floor Fee',
    'Shipment Fee',
    'Body/paint cost',
    'Parts for Body',
    'Rust/Welding',
    'Upholstery',
    'Glass',
    'Mechanic Cost',
    'Parts for Mechanic',
    'Tires',
    'Battery',
    'Inspection & Emission Cost',
    'Detailing Cost',
    'Parts'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Send the form data to the backend for MongoDB storage
    fetch('http://127.0.0.1:5000/api/insert_report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        alert('Error: ' + data.error);
      } else {
        alert('Report added successfully!');
        navigate('/home'); // Navigate back to dashboard or another page after form submission
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
  };

  return (
    <Container maxWidth="sm">
      <Box mt={5}>
        <Typography variant="h4" gutterBottom>
          Enter Details Manually
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="VIN Number"
            variant="outlined"
            fullWidth
            margin="normal"
            name="vin"
            value={formData.vin}
            onChange={handleChange}
            required
          />
          <TextField
            select
            label="Category"
            variant="outlined"
            fullWidth
            margin="normal"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Notes"
            variant="outlined"
            fullWidth
            margin="normal"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
          />
          <TextField
            label="Cost"
            variant="outlined"
            type="number"
            fullWidth
            margin="normal"
            name="cost"
            value={formData.cost}
            onChange={handleChange}
            required
          />
          <TextField
            label="Date Occurred"
            variant="outlined"
            type="date"
            fullWidth
            margin="normal"
            name="date_occurred"
            value={formData.date_occurred}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            required
          />
          <TextField
            label="Location"
            variant="outlined"
            fullWidth
            margin="normal"
            name="location"
            value={formData.location}
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
            required
          />
          <TextField
            label="Address"
            variant="outlined"
            fullWidth
            margin="normal"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />
          <TextField
            label="Comments"
            variant="outlined"
            fullWidth
            margin="normal"
            name="comments"
            value={formData.comments}
            onChange={handleChange}
          />
          <Button variant="contained" color="primary" type="submit" fullWidth>
            Submit Report
          </Button>
        </form>
      </Box>
    </Container>
  );
}
export default EnterDetailsManually;