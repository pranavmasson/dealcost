import React, { useState } from 'react';
import {
  Box,
  Button,
  MenuItem,
  Typography,
  TextField,
  Modal,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { motion, AnimatePresence } from 'framer-motion';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

function EnterDetailsManually({ open, onClose, initialVin }) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const username = localStorage.getItem('username');

    const reportData = {
      ...formData,
      category: isCustomCategory ? formData.customCategory : formData.category,
      date_occurred: formatDate(formData.date_occurred),
      username,
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/insert_report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });
      
      const data = await response.json();
      
      if (data.error) {
        alert('Error: ' + data.error);
        setIsSubmitting(false);
      } else {
        setShowSuccess(true);
        setTimeout(() => {
          onClose();
          localStorage.setItem('refreshDealCost', 'true');
          navigate(`/view-deal/${formData.vin}`);
        }, 1500);
      }
    } catch (error) {
      console.error('Error:', error);
      setIsSubmitting(false);
    }
  };

  const handleScan = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/scan_document`, {
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
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
        >
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
            {showSuccess ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2rem',
                }}
              >
                <CheckCircleOutlineIcon 
                  sx={{ 
                    fontSize: 80, 
                    color: 'success.main',
                    mb: 2 
                  }} 
                />
                <Typography variant="h5" align="center" gutterBottom>
                  Report Submitted Successfully!
                </Typography>
              </motion.div>
            ) : (
              <>
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

                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    fullWidth
                    disabled={isSubmitting}
                    sx={{ mt: 2 }}
                  >
                    {isSubmitting ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      'Submit Report'
                    )}
                  </Button>
                </form>
              </>
            )}
          </Box>
        </motion.div>
      </AnimatePresence>
    </Modal>
  );
}

export default EnterDetailsManually;