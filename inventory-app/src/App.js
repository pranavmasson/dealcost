import React, { useState, useEffect } from 'react';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import CreateAccount from './components/CreateAccount';
import AddCar from './components/AddCar';
import Inventory from './components/Inventory';
import Home from './components/Home';
import AddExpenseReport from './components/AddExpenseReport';
import EnterDetailsManually from './components/EnterDetailsManually';
import ViewDeal from './components/ViewDeal';  // Import the ViewDeal component
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';

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
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            DealCost
          </Typography>
          {!isAuthenticated ? (
            <>
              <Button color="inherit" onClick={() => navigate('/login')}>Login</Button>
              <Button color="inherit" onClick={() => navigate('/create-account')}>Create Account</Button>
            </>
          ) : (
            <>
              <Button color="inherit" onClick={handleLogout}>Logout</Button>
              <Button color="inherit" onClick={() => navigate('/add-car')}>Add Car</Button>
              <Button color="inherit" onClick={() => navigate('/inventory')}>Inventory</Button>
              <Button color="inherit" onClick={() => navigate('/home')}>Dashboard</Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Container>
        <Box mt={4}>
          <Routes>
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
      </Container>
    </div>
  );
}

export default App;