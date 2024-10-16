import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, TextField, Button, Box, Typography } from '@mui/material';

function EditReport() {
  const { reportId } = useParams();
  const [formData, setFormData] = useState({
    date_occurred: '',
    cost: '',
    category: '',
    vendor: '',
    description: '',
    receipt: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the existing report data using reportId
    fetch(`http://127.0.0.1:5000/api/report/${reportId}`)
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setFormData(data);  // Populate the form with existing data
        }
      })
      .catch(err => setError('Failed to load report'));
  }, [reportId]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Submit updated data to the server
    fetch(`http://127.0.0.1:5000/api/report/${reportId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          alert('Report updated successfully');
          navigate('/somepath');  // Navigate to some other page after successful update
        }
      })
      .catch(err => setError('Failed to update report'));
  };

  return (
    <Container maxWidth="sm">
      <Box mt={5}>
        <Typography variant="h4" component="h1" gutterBottom>
          Edit Maintenance Report
        </Typography>
        {error && <Typography color="error">{error}</Typography>}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Date"
            type="date"
            fullWidth
            name="date_occurred"
            value={formData.date_occurred}
            onChange={handleChange}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Cost"
            type="number"
            fullWidth
            name="cost"
            value={formData.cost}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            label="Category"
            fullWidth
            name="category"
            value={formData.category}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            label="Vendor"
            fullWidth
            name="vendor"
            value={formData.vendor}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            label="Description"
            fullWidth
            name="description"
            value={formData.description}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            label="Receipt"
            fullWidth
            name="receipt"
            value={formData.receipt}
            onChange={handleChange}
            margin="normal"
          />
          <Button variant="contained" color="primary" type="submit" fullWidth>
            Update Report
          </Button>
        </form>
      </Box>
    </Container>
  );
}

export default EditReport;