import React, { useState, useEffect } from 'react';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import CreateAccount from './components/CreateAccount';
import AddCar from './components/AddCar';
import Inventory from './components/Inventory';
import Home from './components/Home';
import AddExpenseReport from './components/AddExpenseReport';
import EnterDetailsManually from './components/EnterDetailsManually';
import ViewDeal from './components/ViewDeal';
import SplashScreen from './components/SplashScreen'; // Import your splash screen component
import { Toolbar, Typography, Box, Drawer, List, ListItem, ListItemText } from '@mui/material';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Check localStorage for userToken on app load/refresh
  useEffect(() => {
    const userToken = localStorage.getItem('userToken');
    if (userToken) {
      setIsAuthenticated(true);  // User is logged in, set the state to authenticated
    } else {
      setIsAuthenticated(false);  // No token found, set state to not authenticated
    }
  }, []);

  const handleLogin = (username, token) => {
    localStorage.setItem('userToken', token); // Store token in local storage
    localStorage.setItem('username', username); // Store username in local storage
    setIsAuthenticated(true);
    navigate('/home'); // Redirect to the dashboard after login
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken'); // Remove token from local storage
    localStorage.removeItem('username'); // Remove username from local storage
    setIsAuthenticated(false);
    navigate('/login'); // Redirect to login page after logout
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Drawer for vertical navigation */}
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { 
            width: 240, 
            boxSizing: 'border-box',
            backgroundColor: 'black',
            color: 'white'
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {/* DealCost button that navigates to the splash screen */}
            <ListItem 
              button 
              onClick={() => navigate('/')}  // Navigate to splash screen
              sx={{
                color: 'white',
                '&:hover': { 
                  backgroundColor: '#333', // Custom hover background color
                }
              }}
            >
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                DealCost
              </Typography>
            </ListItem>

            {!isAuthenticated ? (
              <>
                <ListItem 
                  button 
                  onClick={() => navigate('/login')} 
                  sx={{
                    color: 'white',
                    '&:hover': { backgroundColor: '#1a1a1a' }, // Custom hover color for login
                  }}
                >
                  <ListItemText primary="Login" />
                </ListItem>

                <ListItem 
                  button 
                  onClick={() => navigate('/create-account')} 
                  sx={{
                    color: 'white',
                    '&:hover': { backgroundColor: '#1a1a1a' }, // Custom hover color for create account
                  }}
                >
                  <ListItemText primary="Create Account" />
                </ListItem>
              </>
            ) : (
              <>
                <ListItem 
                  button 
                  onClick={() => navigate('/add-car')} 
                  sx={{
                    color: 'white',
                    '&:hover': { backgroundColor: '#1a1a1a' }, // Custom hover color for add car
                  }}
                >
                  <ListItemText primary="Add Car" />
                </ListItem>

                <ListItem 
                  button 
                  onClick={() => navigate('/inventory')} 
                  sx={{
                    color: 'white',
                    '&:hover': { backgroundColor: '#1a1a1a' }, // Custom hover color for inventory
                  }}
                >
                  <ListItemText primary="Inventory" />
                </ListItem>

                <ListItem 
                  button 
                  onClick={handleLogout} 
                  sx={{
                    color: 'white',
                    '&:hover': { backgroundColor: '#1a1a1a' }, // Custom hover color for logout
                  }}
                >
                  <ListItemText primary="Logout" />
                </ListItem>

                <ListItem 
                  button 
                  onClick={() => navigate('/home')} 
                  sx={{
                    color: 'white',
                    '&:hover': { backgroundColor: '#1a1a1a' }, // Custom hover color for dashboard
                  }}
                >
                  <ListItemText primary="Dashboard" />
                </ListItem>
              </>
            )}
          </List>
        </Box>
      </Drawer>

      {/* Main content area */}
      <Box
        sx={{
          flexGrow: 1,  // Take up remaining width
          backgroundColor: '#f5f5f5',  // Optional background color
          padding: '16px',
        }}
      >
        <Routes>
          {/* Set splash screen as the default route */}
          <Route path="/" element={<SplashScreen />} />

          {/* If the user is authenticated, redirect away from the login page */}
          <Route path="/login" element={isAuthenticated ? <Navigate to="/home" /> : <Login onLogin={handleLogin} />} />
          <Route path="/create-account" element={<CreateAccount />} />
          {isAuthenticated ? (
            <>
              <Route path="/home" element={<Home />} />
              <Route path="/add-car" element={<AddCar />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/add-expense-report" element={<AddExpenseReport />} />
              <Route path="/enter-details-manually" element={<EnterDetailsManually />} />
              <Route path="/view-deal/:vin" element={<ViewDeal />} /> {/* Route for viewing deals */}
            </>
          ) : (
            <Route path="*" element={<Navigate to="/login" />} />
          )}
        </Routes>
      </Box>
    </Box>
  );
}

export default App;