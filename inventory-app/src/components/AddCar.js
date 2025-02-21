import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Box, Select, MenuItem, InputLabel, FormControl, Grid, Paper } from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

const formatDate = (date) => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = 2028; year >= 1980; year--) {
    years.push(year);
  }
  return years;
};

function AddCar() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    vin: '',
    make: '',
    model: '',
    trim: '',
    year: new Date().getFullYear().toString(),
    mileage: '',
    color: '',
    purchase_price: '',
    purchaser: '',
    finance_type: 'na',
    sale_status: 'available',
    purchase_date: new Date(),
    title_received: 'na',
    inspection_received: 'no',
    posted_online: false,
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

  const handleSubmit = async (e) => {
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

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/insert_vehicle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(vehicleData),
      });

      if (response.ok) {
        localStorage.setItem('showAddSuccess', 'true');
        navigate('/inventory');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage(error.message || 'An error occurred');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container maxWidth="lg">
        <Box mt={2} mb={2}>
          <motion.div
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <DirectionsCarIcon sx={{ fontSize: 30 }} />
              Add New Vehicle
            </Typography>
          </motion.div>

          <Paper
            elevation={3}
            sx={{
              p: 2,
              borderRadius: 2,
              background: theme => theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            }}
          >
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                {/* Vehicle Identification & Basic Details Combined */}
                <Grid item xs={12} md={8}>
                  <TextField
                    label="VIN"
                    variant="outlined"
                    fullWidth
                    name="vin"
                    value={formData.vin}
                    onChange={handleChange}
                    required
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Year</InputLabel>
                    <Select
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      required
                      label="Year"
                    >
                      {generateYearOptions().map(year => (
                        <MenuItem key={year} value={year.toString()}>
                          {year}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Basic Details Row */}
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Make"
                    variant="outlined"
                    fullWidth
                    name="make"
                    value={formData.make}
                    onChange={handleChange}
                    required
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Model"
                    variant="outlined"
                    fullWidth
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    required
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Trim"
                    variant="outlined"
                    fullWidth
                    name="trim"
                    value={formData.trim}
                    onChange={handleChange}
                    size="small"
                  />
                </Grid>

                {/* Specifications Row */}
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Mileage"
                    variant="outlined"
                    fullWidth
                    name="mileage"
                    value={formData.mileage}
                    onChange={handleChange}
                    required
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Color"
                    variant="outlined"
                    fullWidth
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    required
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Purchase Price"
                    variant="outlined"
                    fullWidth
                    name="purchase_price"
                    type="number"
                    value={formData.purchase_price}
                    onChange={handleChange}
                    required
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} md={12}>
                  <TextField
                    label="Purchaser"
                    variant="outlined"
                    fullWidth
                    name="purchaser"
                    value={formData.purchaser}
                    onChange={handleChange}
                    required
                    size="small"
                  />
                </Grid>

                {/* Status Row */}
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Title Received?</InputLabel>
                    <Select
                      name="title_received"
                      value={formData.title_received}
                      onChange={handleChange}
                      required
                      label="Title Received?"
                    >
                      <MenuItem value="yes">Yes</MenuItem>
                      <MenuItem value="no">No</MenuItem>
                      <MenuItem value="na">N/A</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Inspection Done?</InputLabel>
                    <Select
                      name="inspection_received"
                      value={formData.inspection_received}
                      onChange={handleChange}
                      required
                      label="Inspection Done?"
                    >
                      <MenuItem value="yes">Yes</MenuItem>
                      <MenuItem value="no">No</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Posted Online?</InputLabel>
                    <Select
                      name="posted_online"
                      value={formData.posted_online}
                      onChange={handleChange}
                      required
                      label="Posted Online?"
                    >
                      <MenuItem value={true}>Posted</MenuItem>
                      <MenuItem value={false}>Not Posted</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <DatePicker
                    selected={formData.purchase_date}
                    onChange={handleDateChange}
                    dateFormat="MM/dd/yyyy"
                    customInput={
                      <TextField 
                        label="Purchase Date" 
                        variant="outlined" 
                        fullWidth 
                        size="small"
                      />
                    }
                  />
                </Grid>

                {/* Submit Button */}
                <Grid item xs={12}>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="contained"
                      type="submit"
                      fullWidth
                      sx={{
                        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                        color: 'white',
                        fontWeight: 'bold',
                        padding: '12px',
                        fontSize: '1rem',
                        borderRadius: '8px',
                        textTransform: 'none',
                        boxShadow: '0 4px 15px rgba(33, 203, 243, .3)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #2196F3 60%, #21CBF3 90%)',
                          boxShadow: '0 6px 20px rgba(33, 203, 243, .4)',
                        },
                      }}
                    >
                      Add Vehicle to Inventory
                    </Button>
                  </motion.div>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Box>
      </Container>
    </motion.div>
  );
}

export default AddCar;