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
              <Grid item xs={12} sm={6} md={4} key={item._id}>
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
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={() => handleViewDeal(item.vin)}
                    >
                      View Deal
                    </Button>
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