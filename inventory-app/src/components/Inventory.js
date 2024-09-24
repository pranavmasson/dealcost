import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, Card, CardContent, CardHeader, Button, Switch, FormControlLabel } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [error, setError] = useState('');
  const [showSold, setShowSold] = useState(false); // To toggle between sold and available inventory
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const username = localStorage.getItem('username');  // Retrieve the logged-in username from local storage
        const response = await fetch(`http://127.0.0.1:5000/api/inventory?username=${username}`);
        const data = await response.json();

        if (response.ok) {
          setInventory(data.inventory);
        } else {
          setError(data.error);
        }
      } catch (error) {
        console.error('Error fetching inventory:', error);
        setError('An error occurred while fetching inventory');
      }
    };

    fetchInventory();
  }, []);

  const handleViewDeal = (vin) => {
    navigate(`/view-deal/${vin}`);  // Navigate to the ViewDeal page with the car's VIN
  };

  const handleAddExpenseReport = (vin) => {
    navigate(`/add-expense-report`, { state: { vin } });  // Navigate to AddExpenseReport with VIN passed as state
  };

  const handleEditCar = (vin) => {
    navigate(`/edit-car/${vin}`);  // Navigate to EditCar page with the car's VIN
  };

  const handleDeleteCar = async (vin) => {
    try {
      const username = localStorage.getItem('username');  // Retrieve the logged-in username from local storage

      const response = await fetch(`http://127.0.0.1:5000/api/delete_vehicle`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vin, username }),
      });

      const data = await response.json();

      if (response.ok) {
        setInventory(inventory.filter(item => item.vin !== vin));  // Remove the deleted car from the state
        alert(data.message);
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Error deleting car:', error);
      alert('An error occurred while deleting the car');
    }
  };

  // Filter inventory based on "sale_status" as 'sold' or 'available'
  const filteredInventory = inventory.filter(item => (showSold ? item.sale_status === 'sold' : item.sale_status !== 'sold'));

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const year = d.getFullYear();
    return `${month}/${day}/${year}`;
  };

  return (
    <Container maxWidth="md">
      <Box mt={5}>
        <Typography variant="h4" gutterBottom>
          Your Inventory
        </Typography>

        {/* Toggle between available and sold inventory */}
        <FormControlLabel
          control={<Switch checked={showSold} onChange={() => setShowSold(!showSold)} />}
          label={showSold ? "Show Available" : "Show Sold"}
          sx={{ mb: 2 }}
        />

        {error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <Grid container spacing={4}>
            {filteredInventory.map((item) => (
              <Grid item xs={12} sm={6} md={6} key={item._id}>
                <Card
                  sx={{
                    backgroundColor: 'white',  // Ensure background color is consistent
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Adds a subtle shadow
                    borderRadius: 2, // Rounded corners
                  }}
                >
                  <CardHeader 
                    title={item.vin} 
                    subheader={item.item_name} 
                    sx={{
                      backgroundColor: '#e0e0e0', // Slightly darker gray for the header
                      padding: 2, // Ensure consistent padding in the header
                    }} 
                  />
                  <CardContent
                    sx={{
                      padding: 3,  // Ensure consistent padding in the content
                    }}
                  >
                    <Typography variant="body2" color="textSecondary">
                      <strong>Make:</strong> {item.make || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      <strong>Model:</strong> {item.model || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      <strong>Trim:</strong> {item.trim || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      <strong>Mileage:</strong> {item.mileage || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      <strong>Color:</strong> {item.color || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      <strong>Purchase Price:</strong> ${item.purchase_price}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      <strong>Sale Price:</strong> ${item.sale_price || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      <strong>Description:</strong> {item.item_description || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      <strong>Date Added:</strong> {formatDate(item.date_added)}
                    </Typography>
                    {item.sale_status === 'sold' && (
                      <Typography variant="body2" color="textSecondary">
                        <strong>Date Sold:</strong> {formatDate(item.date_sold)}
                      </Typography>
                    )}
                    <Box mt={2}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                          <Button
                            variant="contained"
                            onClick={() => handleViewDeal(item.vin)}
                            fullWidth
                            sx={{
                              backgroundColor: 'black',
                              color: 'white',
                              borderRadius: 4,
                              fontWeight: 'bold',
                              padding: '10px',
                              '&:hover': {
                                backgroundColor: '#333',
                              }
                            }}
                          >
                            View Deal
                          </Button>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Button
                            variant="contained"
                            onClick={() => handleDeleteCar(item.vin)}
                            fullWidth
                            sx={{
                              backgroundColor: 'black',
                              color: 'white',
                              borderRadius: 4,
                              fontWeight: 'bold',
                              padding: '10px',
                              '&:hover': {
                                backgroundColor: '#333',
                              }
                            }}
                          >
                            Delete Car
                          </Button>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Button
                            variant="contained"
                            onClick={() => handleAddExpenseReport(item.vin)}
                            fullWidth
                            sx={{
                              backgroundColor: 'black',
                              color: 'white',
                              borderRadius: 4,
                              fontWeight: 'bold',
                              padding: '10px',
                              '&:hover': {
                                backgroundColor: '#333',
                              }
                            }}
                          >
                            Add Expense Report
                          </Button>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Button
                            variant="contained"
                            onClick={() => handleEditCar(item.vin)}
                            fullWidth
                            sx={{
                              backgroundColor: 'black',
                              color: 'white',
                              borderRadius: 4,
                              fontWeight: 'bold',
                              padding: '10px',
                              '&:hover': {
                                backgroundColor: '#333',
                              }
                            }}
                          >
                            Edit Car
                          </Button>
                        </Grid>
                      </Grid>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
}

export default Inventory;