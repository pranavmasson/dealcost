import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  const handleViewInventory = () => {
    navigate('/inventory');  // Navigate to the inventory page
  };

  const handleAddCar = () => {
    navigate('/add-car');  // Navigate to the add car page
  };

  const handleAddExpenseReport = () => {
    navigate('/add-expense-report');  // Navigate to the add expense report page
  };

  return (
    <Container maxWidth="md">
      <Box mt={5} textAlign="center">
        <Typography variant="h4" gutterBottom>
          Welcome to Your Dashboard
        </Typography>
        <Button 
          variant="contained" 
          onClick={handleViewInventory} 
          sx={{ 
            m: 1, 
            backgroundColor: 'black', 
            color: 'white', 
            '&:hover': { backgroundColor: '#333' } 
          }}
        >
          View Inventory
        </Button>
        <Button 
          variant="contained" 
          onClick={handleAddCar} 
          sx={{ 
            m: 1, 
            backgroundColor: 'black', 
            color: 'white', 
            '&:hover': { backgroundColor: '#333' } 
          }}
        >
          Add New Car
        </Button>
        <Button 
          variant="contained" 
          onClick={handleAddExpenseReport} 
          sx={{ 
            m: 1, 
            backgroundColor: 'black', 
            color: 'white', 
            '&:hover': { backgroundColor: '#333' } 
          }}
        >
          Add Expense Report
        </Button>
      </Box>
    </Container>
  );
}

export default Home;