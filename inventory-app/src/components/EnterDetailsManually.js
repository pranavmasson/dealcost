import React, { useState } from 'react';
import {
  Box,
  Button,
  MenuItem,
  Typography,
  TextField,
  Modal,
} from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function EnterDetailsManually({ open, onClose, initialVin }) {
  const [formData, setFormData] = useState({
    vin: initialVin || '',
    category: '',
    customCategory: '',
    notes: '',
    cost: '',
    date_occurred: new Date(),
    service_provider: '',
    comments: '',
  });

  const [isCustomCategory, setIsCustomCategory] = useState(false);

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
    'Custom',
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

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      date_occurred: date,
    });
  };

  const formatDate = (date) => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const username = localStorage.getItem('username');

    const reportData = {
      ...formData,
      category: isCustomCategory ? formData.customCategory : formData.category,
      date_occurred: formatDate(formData.date_occurred),
      username,
    };

    fetch('${process.env.REACT_APP_API_URL}/api/insert_report', {
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
          onClose(); // Close modal after success
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  const handleScan = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('${process.env.REACT_APP_API_URL}/api/scan_document', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.error) {
        alert('Error scanning document: ' + data.error);
      } else {
        setFormData((prevData) => ({
          ...prevData,
          date_occurred: data.date_occurred ? new Date(data.date_occurred) : prevData.date_occurred,
          service_provider: data.service_provider || prevData.service_provider,
          cost: data.cost || prevData.cost,
          vin: data.vin || prevData.vin,
        }));
      }
    } catch (error) {
      console.error('Error during OCR scan:', error);
    }
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="enter-details-modal">
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
            InputProps={{ readOnly: !!initialVin }}
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
            label="Description"
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

          <Typography variant="h6" gutterBottom>
            Date Occurred
          </Typography>
          <DatePicker
            selected={formData.date_occurred}
            onChange={handleDateChange}
            dateFormat="MM/dd/yyyy"
            customInput={<TextField variant="outlined" fullWidth />}
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

          <Button
            variant="contained"
            component="label"
            color="secondary"
            fullWidth
            style={{ marginBottom: '10px' }}
          >
            Scan Document
            <input type="file" hidden onChange={handleScan} accept="image/*" />
          </Button>

          <Button variant="contained" color="primary" type="submit" fullWidth>
            Submit Report
          </Button>
        </form>
      </Box>
    </Modal>
  );
}

export default EnterDetailsManually;