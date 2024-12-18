import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom';

const formatDate = (date) => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

function EditCar({ open, onClose, vin }) {
  const [formData, setFormData] = useState({
    vin: '',
    make: '',
    model: '',
    trim: '',
    year: '',
    mileage: '',
    color: '',
    purchase_price: '',
    sale_price: '',
    sale_type: '',
    finance_type: 'na',
    sale_status: 'available',
    purchase_date: new Date(),
    title_received: 'na',
    closing_statement: '',
    pending_issues: '', // Added field for Pending Issues
    date_sold: null,
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    if (!vin || !open) return;

    const fetchCarDetails = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/api/inventory/${vin}`);
        const data = await response.json();

        if (response.ok) {
          setFormData({
            ...data,
            purchase_date: data.purchase_date ? new Date(data.purchase_date) : new Date(),
            date_sold: data.date_sold ? new Date(data.date_sold) : null,
            pending_issues: data.pending_issues || '', // Initialize pending issues if present
          });
        } else {
          setMessage('Failed to load car details');
        }
      } catch (error) {
        console.error('Error fetching car details:', error);
        setMessage('Error fetching car details');
      } finally {
        setLoading(false);
      }
    };

    fetchCarDetails();
  }, [vin, open]);

  const handleDateChange = (field, date) => {
    setFormData({ ...formData, [field]: date });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleToggleSaleStatus = () => {
    const isSold = formData.sale_status === 'sold';

    setFormData({
      ...formData,
      sale_status: isSold ? 'available' : 'sold',
      date_sold: isSold ? null : new Date(),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`http://127.0.0.1:5000/api/update_vehicle/${vin}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          purchase_date: formatDate(formData.purchase_date),
          date_sold: formData.date_sold ? formatDate(formData.date_sold) : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update car');
      }

      const data = await response.json();
      setMessage('Car updated successfully!');
      setTimeout(() => {
        setMessage('');
        onClose();
        navigate('/inventory', { replace: true });
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Error updating car:', error);
      setMessage(error.message || 'An error occurred');
    }
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="edit-car-modal" aria-describedby="edit-car-details">
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '600px',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          overflowY: 'auto',
          maxHeight: '90vh',
        }}
      >
        {loading ? (
          <Typography variant="h6">Loading...</Typography>
        ) : (
          <>
            <Typography variant="h4" gutterBottom>
              Edit Car
            </Typography>
            <form onSubmit={handleSubmit}>
              <Typography variant="h6" gutterBottom>
                Vehicle Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="VIN"
                    name="vin"
                    value={formData.vin}
                    onChange={handleChange}
                    fullWidth
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Make"
                    name="make"
                    value={formData.make}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Model"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Trim"
                    name="trim"
                    value={formData.trim}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Year"
                    name="year"
                    type="number"
                    value={formData.year}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Mileage"
                    name="mileage"
                    type="number"
                    value={formData.mileage}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Pending Issues"
                    name="pending_issues"
                    value={formData.pending_issues}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Color"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
              </Grid>
              <Box mt={4}>
                <Typography variant="h6" gutterBottom>
                  Financial Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Purchase Price"
                      name="purchase_price"
                      type="number"
                      value={formData.purchase_price}
                      onChange={handleChange}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Sale Price"
                      name="sale_price"
                      type="number"
                      value={formData.sale_price}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Sale Type</InputLabel>
                      <Select
                        name="sale_type"
                        value={formData.sale_type}
                        onChange={handleChange}
                      >
                        <MenuItem value="floor">Floor</MenuItem>
                        <MenuItem value="dealer">Dealer</MenuItem>
                        <MenuItem value="consignment">Consignment</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Finance Type</InputLabel>
                      <Select
                        name="finance_type"
                        value={formData.finance_type}
                        onChange={handleChange}
                      >
                        <MenuItem value="na">N/A</MenuItem>
                        <MenuItem value="cash">Cash</MenuItem>
                        <MenuItem value="finance">Finance</MenuItem>
                        <MenuItem value="outside finance">Outside Finance</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Title Received?</InputLabel>
                      <Select
                        name="title_received"
                        value={formData.title_received}
                        onChange={handleChange}
                      >
                        <MenuItem value="yes">Yes</MenuItem>
                        <MenuItem value="no">No</MenuItem>
                        <MenuItem value="na">N/A</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Closing Statement"
                      name="closing_statement"
                      value={formData.closing_statement}
                      onChange={handleChange}
                      fullWidth
                      multiline
                      rows={3}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <DatePicker
                      selected={formData.purchase_date}
                      onChange={(date) => handleDateChange('purchase_date', date)}
                      customInput={<TextField label="Purchase Date" fullWidth />}
                    />
                  </Grid>
                  {formData.sale_status === 'sold' && (
                    <Grid item xs={12}>
                      <DatePicker
                        selected={formData.date_sold}
                        onChange={(date) => handleDateChange('date_sold', date)}
                        customInput={<TextField label="Date Sold" fullWidth />}
                      />
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={<Switch checked={formData.sale_status === 'sold'} onChange={handleToggleSaleStatus} />}
                      label={formData.sale_status === 'sold' ? 'Sold' : 'Available'}
                    />
                  </Grid>
                </Grid>
              </Box>
              <Box mt={3} textAlign="right">
                <Button type="submit" variant="contained" color="primary">
                  Save Changes
                </Button>
              </Box>
            </form>
            {message && (
              <Typography color={message.includes('success') ? 'green' : 'red'} mt={2}>
                {message}
              </Typography>
            )}
          </>
        )}
      </Box>
    </Modal>
  );
}

export default EditCar;