import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Typography, Box, Switch, FormControlLabel, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

function EditCar() {
  const { vin } = useParams();  // Get VIN from the URL params
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    trim: '',
    year: '',
    mileage: '',
    color: '',
    purchase_price: '',
    sale_price: '',
    sale_status: 'available',  // Initialize as 'available' by default
    date_sold: '',  // Initialize date_sold as an empty string
    closing_statement: '', // New field for closing statement
    sale_type: 'floor', // Default value for sale type
    finance_type: 'cash' // Default value for finance type
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/api/inventory/${vin}`);
        const data = await response.json();

        if (response.ok) {
          setFormData({
            make: data.make,
            model: data.model,
            trim: data.trim || '',
            year: data.year,
            mileage: data.mileage,
            color: data.color,
            purchase_price: data.purchase_price,
            sale_price: data.sale_price,
            sale_status: data.sale_status || 'available',  // Set sale_status to 'available' if undefined
            date_sold: data.date_sold || '',  // Load the date_sold if it exists
            closing_statement: data.closing_statement || '',  // Load the closing_statement if it exists
            sale_type: data.sale_type || 'floor',  // Load sale type if it exists
            finance_type: data.finance_type || 'cash',  // Load finance type if it exists
          });
        } else {
          setMessage('Failed to load car details');
        }
      } catch (error) {
        console.error('Error fetching car details:', error);
        setMessage('Error fetching car details');
      }
    };

    fetchCarDetails();
  }, [vin]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleToggleSaleStatus = () => {
    const isSold = formData.sale_status === 'sold';
  
    const formatDate = (date) => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    };
  
    const currentDate = isSold ? '' : formatDate(new Date());
  
    setFormData({
      ...formData,
      sale_status: isSold ? 'available' : 'sold',
      date_sold: isSold ? '' : currentDate,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`http://127.0.0.1:5000/api/update_vehicle/${vin}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMessage('Car updated successfully!');
      setTimeout(() => {
        navigate('/inventory');  // Redirect back to inventory after success
      }, 2000);
    } catch (error) {
      console.error('Error updating car:', error);
      setMessage('Error updating car');
    }
  };

  return (
    <Container maxWidth="md">
      <Box mt={5}>
        <Typography variant="h4" gutterBottom>
          Edit Car
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
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

            <Grid item xs={12} sm={4}>
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
                required
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="Mileage"
                variant="outlined"
                fullWidth
                margin="normal"
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
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="Purchase Price"
                variant="outlined"
                fullWidth
                margin="normal"
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
                  <MenuItem value="consignment">Consignment</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Dropdown for Finance Type */}
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth margin="normal" variant="outlined">
                <InputLabel id="finance-type-label">Finance Type</InputLabel>
                <Select
                  labelId="finance-type-label"
                  label="Finance Type"
                  name="finance_type"
                  value={formData.finance_type}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="finance">Finance</MenuItem>
                  <MenuItem value="outside finance">Outside Finance</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="Closing Statement"
                variant="outlined"
                fullWidth
                margin="normal"
                name="closing_statement"
                value={formData.closing_statement}
                onChange={handleChange}
                multiline
                rows={4}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.sale_status === 'sold'}
                    onChange={handleToggleSaleStatus}
                  />
                }
                label={formData.sale_status === 'sold' ? "Sold" : "Available"}
                sx={{ mt: 2, mb: 2 }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Button variant="contained" color="primary" type="submit" fullWidth sx={{ mt: 2 }}>
                Save Changes
              </Button>
            </Grid>
          </Grid>
        </form>
        {message && <Typography color="primary" mt={2}>{message}</Typography>}
      </Box>
    </Container>
  );
}

export default EditCar;