import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, Card, CardContent, CardHeader, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [error, setError] = useState('');
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

  return (
    <Container maxWidth="md">
      <Box mt={5}>
        <Typography variant="h4" gutterBottom>
          Your Inventory
        </Typography>
        {error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <Grid container spacing={4}>
            {inventory.map((item) => (
              <Grid item xs={12} sm={6} md={6} key={item._id}>
                <Card>
                  <CardHeader title={item.vin} subheader={item.item_name} />
                  <CardContent>
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
                    <Box mt={2}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                          <Button 
                            variant="contained" 
                            color="primary" 
                            onClick={() => handleViewDeal(item.vin)}
                            fullWidth
                            sx={{ borderRadius: 4, fontWeight: 'bold', padding: '10px' }}
                          >
                            View Deal
                          </Button>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Button 
                            variant="contained" 
                            color="secondary" 
                            onClick={() => handleDeleteCar(item.vin)}
                            fullWidth
                            sx={{ borderRadius: 4, fontWeight: 'bold', padding: '10px' }}
                          >
                            Delete Car
                          </Button>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Button 
                            variant="contained" 
                            color="primary" 
                            onClick={() => handleAddExpenseReport(item.vin)}
                            fullWidth
                            sx={{ borderRadius: 4, fontWeight: 'bold', padding: '10px' }}
                          >
                            Add Expense Report
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