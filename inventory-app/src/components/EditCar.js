import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Typography, Box, Switch, FormControlLabel } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

function EditCar() {
  const { vin } = useParams();  // Get VIN from the URL params
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    mileage: '',
    color: '',
    purchase_price: '',
    sale_price: '',
    sale_status: 'available',  // Initialize as 'available' by default
    date_sold: '',  // Initialize date_sold as an empty string
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
            year: data.year,
            mileage: data.mileage,
            color: data.color,
            purchase_price: data.purchase_price,
            sale_price: data.sale_price,
            sale_status: data.sale_status || 'available',  // Set sale_status to 'available' if undefined
            date_sold: data.date_sold || '',  // Load the date_sold if it exists
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
  
    // Create a function to format the date with padded zeros
    const formatDate = (date) => {
      const day = String(date.getDate()).padStart(2, '0');  // Get day and pad with zero if needed
      const month = String(date.getMonth() + 1).padStart(2, '0');  // Get month (0-based) and pad with zero
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;  // Return formatted date as MM/DD/YYYY
    };
  
    const currentDate = isSold ? '' : formatDate(new Date());  // Set current date in MM/DD/YYYY format if sold
  
    setFormData({
      ...formData,
      sale_status: isSold ? 'available' : 'sold',  // Toggle between 'sold' and 'available'
      date_sold: isSold ? '' : currentDate,  // Set or clear the date_sold
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
        body: JSON.stringify(formData),  // Send the updated formData including sale_status and date_sold
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
    <Container maxWidth="sm">
      <Box mt={5}>
        <Typography variant="h4" gutterBottom>
          Edit Car
        </Typography>
        <form onSubmit={handleSubmit}>
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
            label="Year"
            variant="outlined"
            fullWidth
            margin="normal"
            name="year"
            value={formData.year}
            onChange={handleChange}
            required
          />
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
          <TextField
            label="Color"
            variant="outlined"
            fullWidth
            margin="normal"
            name="color"
            value={formData.color}
            onChange={handleChange}
          />
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
          <TextField
            label="Sale Price"
            variant="outlined"
            fullWidth
            margin="normal"
            name="sale_price"
            value={formData.sale_price}
            onChange={handleChange}
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.sale_status === 'sold'}  // Check if sale_status is 'sold'
                onChange={handleToggleSaleStatus}
              />
            }
            label={formData.sale_status === 'sold' ? "Sold" : "Available"}
            sx={{ mt: 2, mb: 2 }}
          />
          <Button variant="contained" color="primary" type="submit" fullWidth>
            Save Changes
          </Button>
        </form>
        {message && <Typography color="primary" mt={2}>{message}</Typography>}
      </Box>
    </Container>
  );
}

export default EditCar;