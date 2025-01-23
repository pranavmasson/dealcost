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
  IconButton,
} from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';

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
    purchaser: '',
    sale_type: 'na',
    finance_type: 'na',
    sale_status: 'available',
    purchase_date: new Date(),
    title_received: 'na',
    inspection_received: 'no',
    closing_statement: '',
    pending_issues: '',
    date_sold: null,
    posted_online: "not posted",
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    if (!vin || !open) return;

    const fetchCarDetails = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/inventory/${vin}`);
        const data = await response.json();

        if (response.ok) {
          setFormData({
            ...data,
            purchase_date: data.purchase_date ? new Date(data.purchase_date) : new Date(),
            date_sold: data.date_sold ? new Date(data.date_sold) : null,
            pending_issues: data.pending_issues || '',
            posted_online: data.posted_online || 'not posted',
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
    setMessage('');

    try {
      const username = localStorage.getItem('username');
      const requestData = {
        ...formData,
        username,
        purchase_date: formatDate(formData.purchase_date),
        date_sold: formData.date_sold ? formatDate(formData.date_sold) : null,
      };

      console.log('Sending update request:', {
        vin,
        username,
        data: requestData
      });

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/update_vehicle/${vin}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      console.log('Server response:', data);

      if (response.ok) {
        setMessage('Car updated successfully!');
      } else {
        console.error('Server error:', data.error);
      }
      
      setTimeout(() => {
        onClose();
        navigate('/inventory', { state: { refresh: true } });
      }, 500);
    } catch (error) {
      console.error('Error updating car:', error);
      setMessage('An error occurred while updating the car');
      
      setTimeout(() => {
        onClose();
        navigate('/inventory', { state: { refresh: true } });
      }, 500);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <Modal 
          open={open} 
          onClose={onClose}
          aria-labelledby="edit-car-modal"
          aria-describedby="edit-car-details"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '90%',
                maxWidth: '800px',
                maxHeight: '90vh',
                overflowY: 'auto',
                bgcolor: 'background.paper',
                borderRadius: 3,
                boxShadow: theme => theme.palette.mode === 'dark'
                  ? '0 0 30px rgba(0, 0, 0, 0.5)'
                  : '0 0 30px rgba(0, 0, 0, 0.2)',
                p: 4,
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#888',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: '#666',
                },
              }}
            >
              <IconButton
                onClick={onClose}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  color: (theme) => theme.palette.grey[500],
                  padding: '12px',
                  '& .MuiSvgIcon-root': {
                    fontSize: '28px',
                  },
                  '&:hover': {
                    color: (theme) => theme.palette.grey[700],
                  },
                }}
              >
                <CloseIcon />
              </IconButton>

              {loading ? (
                <Typography variant="h6">Loading...</Typography>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Typography
                    variant="h4"
                    sx={{
                      mb: 4,
                      fontWeight: 700,
                      background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textAlign: 'center'
                    }}
                  >
                    Edit Vehicle Details
                  </Typography>

                  <form onSubmit={handleSubmit}>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          mb: 2,
                          color: 'text.secondary',
                          fontWeight: 600
                        }}
                      >
                        Vehicle Information
                      </Typography>

                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="VIN"
                            name="vin"
                            value={formData.vin}
                            onChange={handleChange}
                            fullWidth
                            disabled
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                  borderColor: 'rgba(0, 0, 0, 0.23)',
                                  transition: 'border-color 0.3s',
                                },
                                '&:hover fieldset': {
                                  borderColor: 'primary.main',
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: 'primary.main',
                                },
                              },
                            }}
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
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                  borderColor: 'rgba(0, 0, 0, 0.23)',
                                  transition: 'border-color 0.3s',
                                },
                                '&:hover fieldset': {
                                  borderColor: 'primary.main',
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: 'primary.main',
                                },
                              },
                            }}
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
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                  borderColor: 'rgba(0, 0, 0, 0.23)',
                                  transition: 'border-color 0.3s',
                                },
                                '&:hover fieldset': {
                                  borderColor: 'primary.main',
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: 'primary.main',
                                },
                              },
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Trim"
                            name="trim"
                            value={formData.trim}
                            onChange={handleChange}
                            fullWidth
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                  borderColor: 'rgba(0, 0, 0, 0.23)',
                                  transition: 'border-color 0.3s',
                                },
                                '&:hover fieldset': {
                                  borderColor: 'primary.main',
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: 'primary.main',
                                },
                              },
                            }}
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
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                  borderColor: 'rgba(0, 0, 0, 0.23)',
                                  transition: 'border-color 0.3s',
                                },
                                '&:hover fieldset': {
                                  borderColor: 'primary.main',
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: 'primary.main',
                                },
                              },
                            }}
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
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                  borderColor: 'rgba(0, 0, 0, 0.23)',
                                  transition: 'border-color 0.3s',
                                },
                                '&:hover fieldset': {
                                  borderColor: 'primary.main',
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: 'primary.main',
                                },
                              },
                            }}
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
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                  borderColor: 'rgba(0, 0, 0, 0.23)',
                                  transition: 'border-color 0.3s',
                                },
                                '&:hover fieldset': {
                                  borderColor: 'primary.main',
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: 'primary.main',
                                },
                              },
                            }}
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
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                  borderColor: 'rgba(0, 0, 0, 0.23)',
                                  transition: 'border-color 0.3s',
                                },
                                '&:hover fieldset': {
                                  borderColor: 'primary.main',
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: 'primary.main',
                                },
                              },
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Purchaser"
                            name="purchaser"
                            value={formData.purchaser}
                            onChange={handleChange}
                            fullWidth
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                  borderColor: 'rgba(0, 0, 0, 0.23)',
                                  transition: 'border-color 0.3s',
                                },
                                '&:hover fieldset': {
                                  borderColor: 'primary.main',
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: 'primary.main',
                                },
                              },
                            }}
                          />
                        </Grid>
                      </Grid>

                      <Box mt={4}>
                        <Typography
                          variant="h6"
                          sx={{
                            mb: 2,
                            color: 'text.secondary',
                            fontWeight: 600
                          }}
                        >
                          Financial Details
                        </Typography>
                        <Grid container spacing={3}>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              label="Purchase Price"
                              name="purchase_price"
                              type="number"
                              value={formData.purchase_price}
                              onChange={handleChange}
                              fullWidth
                              required
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  '& fieldset': {
                                    borderColor: 'rgba(0, 0, 0, 0.23)',
                                    transition: 'border-color 0.3s',
                                  },
                                  '&:hover fieldset': {
                                    borderColor: 'primary.main',
                                  },
                                  '&.Mui-focused fieldset': {
                                    borderColor: 'primary.main',
                                  },
                                },
                              }}
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
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  '& fieldset': {
                                    borderColor: 'rgba(0, 0, 0, 0.23)',
                                    transition: 'border-color 0.3s',
                                  },
                                  '&:hover fieldset': {
                                    borderColor: 'primary.main',
                                  },
                                  '&.Mui-focused fieldset': {
                                    borderColor: 'primary.main',
                                  },
                                },
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <FormControl fullWidth>
                              <InputLabel>Purchase Fund Source</InputLabel>
                              <Select
                                name="sale_type"
                                value={formData.sale_type}
                                onChange={handleChange}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                      borderColor: 'rgba(0, 0, 0, 0.23)',
                                      transition: 'border-color 0.3s',
                                    },
                                    '&:hover fieldset': {
                                      borderColor: 'primary.main',
                                    },
                                    '&.Mui-focused fieldset': {
                                      borderColor: 'primary.main',
                                    },
                                  },
                                }}
                              >
                                <MenuItem value="floor">Floor</MenuItem>
                                <MenuItem value="dealer">Dealer</MenuItem>
                                <MenuItem value="consignment">Consignment</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <FormControl fullWidth>
                              <InputLabel>Sale Type</InputLabel>
                              <Select
                                name="finance_type"
                                value={formData.finance_type}
                                onChange={handleChange}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                      borderColor: 'rgba(0, 0, 0, 0.23)',
                                      transition: 'border-color 0.3s',
                                    },
                                    '&:hover fieldset': {
                                      borderColor: 'primary.main',
                                    },
                                    '&.Mui-focused fieldset': {
                                      borderColor: 'primary.main',
                                    },
                                  },
                                }}
                              >
                                <MenuItem value="cash">Cash</MenuItem>
                                <MenuItem value="finance">Finance</MenuItem>
                                <MenuItem value="bph">BPH</MenuItem>
                                <MenuItem value="outside finance">Outside Finance</MenuItem>
                                <MenuItem value="na">N/A</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <FormControl fullWidth>
                              <InputLabel>Title Received?</InputLabel>
                              <Select
                                name="title_received"
                                value={formData.title_received}
                                onChange={handleChange}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                      borderColor: 'rgba(0, 0, 0, 0.23)',
                                      transition: 'border-color 0.3s',
                                    },
                                    '&:hover fieldset': {
                                      borderColor: 'primary.main',
                                    },
                                    '&.Mui-focused fieldset': {
                                      borderColor: 'primary.main',
                                    },
                                  },
                                }}
                              >
                                <MenuItem value={true}>Yes</MenuItem>
                                <MenuItem value={false}>No</MenuItem>
                                <MenuItem value="na">N/A</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <FormControl fullWidth>
                              <InputLabel>Inspection Done?</InputLabel>
                              <Select
                                name="inspection_received"
                                value={formData.inspection_received}
                                onChange={handleChange}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                      borderColor: 'rgba(0, 0, 0, 0.23)',
                                      transition: 'border-color 0.3s',
                                    },
                                    '&:hover fieldset': {
                                      borderColor: 'primary.main',
                                    },
                                    '&.Mui-focused fieldset': {
                                      borderColor: 'primary.main',
                                    },
                                  },
                                }}
                              >
                                <MenuItem value="yes">Yes</MenuItem>
                                <MenuItem value="no">No</MenuItem>
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
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  '& fieldset': {
                                    borderColor: 'rgba(0, 0, 0, 0.23)',
                                    transition: 'border-color 0.3s',
                                  },
                                  '&:hover fieldset': {
                                    borderColor: 'primary.main',
                                  },
                                  '&.Mui-focused fieldset': {
                                    borderColor: 'primary.main',
                                  },
                                },
                              }}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <DatePicker
                              selected={formData.purchase_date}
                              onChange={(date) => handleDateChange('purchase_date', date)}
                              customInput={<TextField label="Purchase Date" fullWidth />}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  '& fieldset': {
                                    borderColor: 'rgba(0, 0, 0, 0.23)',
                                    transition: 'border-color 0.3s',
                                  },
                                  '&:hover fieldset': {
                                    borderColor: 'primary.main',
                                  },
                                  '&.Mui-focused fieldset': {
                                    borderColor: 'primary.main',
                                  },
                                },
                              }}
                            />
                          </Grid>
                          {formData.sale_status === 'sold' && (
                            <Grid item xs={12}>
                              <DatePicker
                                selected={formData.date_sold}
                                onChange={(date) => handleDateChange('date_sold', date)}
                                customInput={<TextField label="Date Sold" fullWidth />}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                      borderColor: 'rgba(0, 0, 0, 0.23)',
                                      transition: 'border-color 0.3s',
                                    },
                                    '&:hover fieldset': {
                                      borderColor: 'primary.main',
                                    },
                                    '&.Mui-focused fieldset': {
                                      borderColor: 'primary.main',
                                    },
                                  },
                                }}
                              />
                            </Grid>
                          )}
                          <Grid item xs={12}>
                            <FormControlLabel
                              control={<Switch checked={formData.sale_status === 'sold'} onChange={handleToggleSaleStatus} />}
                              label={formData.sale_status === 'sold' ? 'Sold' : 'Available'}
                            />
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <FormControl fullWidth variant="outlined">
                              <InputLabel id="posted-online-label">Posted Online?</InputLabel>
                              <Select
                                labelId="posted-online-label"
                                label="Posted Online?"
                                name="posted_online"
                                value={formData.posted_online}
                                onChange={handleChange}
                                required
                              >
                                <MenuItem value="posted">Posted</MenuItem>
                                <MenuItem value="not posted">Not Posted</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                        </Grid>
                      </Box>

                      <Box mt={4} textAlign="right">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            type="submit"
                            variant="contained"
                            sx={{
                              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                              color: 'white',
                              px: 4,
                              py: 1.5,
                              borderRadius: 2,
                              boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                background: 'linear-gradient(45deg, #2196F3 60%, #21CBF3 90%)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 6px 10px 2px rgba(33, 203, 243, .3)',
                              },
                            }}
                          >
                            Save Changes
                          </Button>
                        </motion.div>
                      </Box>
                    </motion.div>
                  </form>

                  {message && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Typography
                        sx={{
                          mt: 2,
                          p: 2,
                          borderRadius: 2,
                          textAlign: 'center',
                          color: message.includes('success') ? 'success.main' : 'error.main',
                          bgcolor: message.includes('success') ? 'success.lighter' : 'error.lighter',
                        }}
                      >
                        {message}
                      </Typography>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </Box>
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>
  );
}

export default EditCar;