import React, { useState } from 'react';
import { Container, TextField, Button, MenuItem, Typography, Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

function EnterDetailsManually() {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract VIN from the location state, if provided
  const { vin } = location.state || {};

  const [formData, setFormData] = useState({
    vin: vin || '',  // Pre-fill the VIN if passed from previous page, otherwise leave it empty
    category: '',
    customCategory: '',  // To store custom category if selected
    notes: '',
    cost: '',
    date_occurred: '',
    service_provider: '',  // Changed from location to service provider
    comments: ''  // Removed phone number and address
  });

  const [isCustomCategory, setIsCustomCategory] = useState(false); // Track if custom category is selected

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
    'Parts',
    'Custom'  // Add an option for custom category
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'category') {
      setIsCustomCategory(value === 'Custom');
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Determine whether to send the custom category or the selected one
    const reportData = {
      ...formData,
      category: isCustomCategory ? formData.customCategory : formData.category
    };

    // Send the form data to the backend for MongoDB storage
    fetch('http://127.0.0.1:5000/api/insert_report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reportData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          alert('Error: ' + data.error);
        } else {
          alert('Report added successfully!');
          navigate('/home'); // Navigate back to dashboard or another page after form submission
        }
      })
      .catch((error) => {
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
            InputProps={{ readOnly: !!vin }}  // Make VIN field read-only if pre-filled
          />

          {/* Category Dropdown */}
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

          {/* Custom Category Field */}
          {isCustomCategory && (
            <TextField
              label="Custom Category"
              variant="outlined"
              fullWidth
              margin="normal"
              name="customCategory"
              value={formData.customCategory}
              onChange={handleChange}
              required
            />
          )}

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
            label="Service Provider"
            variant="outlined"
            fullWidth
            margin="normal"
            name="service_provider"
            value={formData.service_provider}
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