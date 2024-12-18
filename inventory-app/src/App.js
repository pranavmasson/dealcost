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
import SplashScreen from './components/SplashScreen';
import UserSettings from './components/UserSettings'; // Import the UserSettings component
import { AppBar, Toolbar, Typography, Box, Drawer, List, ListItem, ListItemText, IconButton, CssBaseline } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import EditCar from './components/EditCar'; // Import your EditCar component
import EditReport from './components/EditReport';  // Assuming EditReport is the component for editing the report

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [open, setOpen] = useState(true); // State to handle sidebar collapse/expand
  const [companyName, setCompanyName] = useState('');
  const navigate = useNavigate();

  // Fetch token and company name from localStorage on component mount
  useEffect(() => {
    const userToken = localStorage.getItem('userToken');
    const storedCompanyName = localStorage.getItem('company_name');
    if (storedCompanyName) {
      setCompanyName(storedCompanyName); // Set company name state
    }
    if (userToken) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (username, token, company_name) => {
    /*localStorage.setItem('userToken', token);*/
    localStorage.setItem('username', username);
    localStorage.setItem('company_name', company_name);
    setCompanyName(company_name);
    setIsAuthenticated(true);
    navigate('/home'); // Navigate to dashboard after login
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('username');
    localStorage.removeItem('company_name');
    setIsAuthenticated(false);
    setCompanyName(''); // Clear company name after logout
    navigate('/login');
  };

  const toggleDrawer = () => {
    setOpen(!open);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <CssBaseline />

      {/* AppBar with Menu Icon */}
      <AppBar
  position="fixed"
  sx={{
    width: open ? `calc(100% - 240px)` : '100%', // Use template literals for calc
    ml: open ? `240px` : 0, // Ensure consistent formatting
    transition: 'width 0.3s ease',
    backgroundColor: '#1763a6', // Changed color to #1763a6
  }}
>

        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={toggleDrawer}
            edge="start"
            sx={{ mr: 2, ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Drawer (Collapsible Sidebar) */}
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          width: open ? 240 : 60, // Adjust width based on 'open' state
          flexShrink: 0,
          ['& .MuiDrawer-paper']: {
            width: open ? 240 : 60,
            boxSizing: 'border-box',
            backgroundColor: '#1763a6', // Changed color to #1763a6
            color: 'white',
            transition: 'width 0.3s ease',
          },
        }}
      >
        <Toolbar>
          <IconButton onClick={toggleDrawer} sx={{ color: 'white' }}>
            {open ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
        </Toolbar>
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {/* Collapsible Sidebar - Icons when closed, Text when expanded */}
            <ListItem
              button
              onClick={() => navigate('/')}
              sx={{
                color: 'white',
                '&:hover': { backgroundColor: '#333' }
              }}
            >
              <Typography variant="h6" component="div" sx={{ flexGrow: 1, display: open ? 'block' : 'none' }}>
                DealCost
              </Typography>
            </ListItem>

            {!isAuthenticated ? (
              <>
                <ListItem button onClick={() => navigate('/login')} sx={{ color: 'white', '&:hover': { backgroundColor: '#1a1a1a' } }}>
                  <ListItemText primary="Login" sx={{ display: open ? 'block' : 'none' }} />
                </ListItem>

                <ListItem button onClick={() => navigate('/create-account')} sx={{ color: 'white', '&:hover': { backgroundColor: '#1a1a1a' } }}>
                  <ListItemText primary="Create Account" sx={{ display: open ? 'block' : 'none' }} />
                </ListItem>
              </>
            ) : (
              <>
                <ListItem button onClick={() => navigate('/add-car')} sx={{ color: 'white', '&:hover': { backgroundColor: '#1a1a1a' } }}>
                  <ListItemText primary="Add Car" sx={{ display: open ? 'block' : 'none' }} />
                </ListItem>

                <ListItem button onClick={() => navigate('/inventory')} sx={{ color: 'white', '&:hover': { backgroundColor: '#1a1a1a' } }}>
                  <ListItemText primary="Inventory" sx={{ display: open ? 'block' : 'none' }} />
                </ListItem>

                <ListItem button onClick={() => navigate('/home')} sx={{ color: 'white', '&:hover': { backgroundColor: '#1a1a1a' } }}>
                  <ListItemText primary="Dashboard" sx={{ display: open ? 'block' : 'none' }} />
                </ListItem>

                <ListItem button onClick={() => navigate('/user-settings')} sx={{ color: 'white', '&:hover': { backgroundColor: '#1a1a1a' } }}>
                  <ListItemText primary="User Settings" sx={{ display: open ? 'block' : 'none' }} />
                </ListItem>

                <ListItem button onClick={handleLogout} sx={{ color: 'white', '&:hover': { backgroundColor: '#1a1a1a' } }}>
                  <ListItemText primary="Logout" sx={{ display: open ? 'block' : 'none' }} />
                </ListItem>
              </>
            )}
          </List>
        </Box>
      </Drawer>

      {/* Main content area */}
      <Box
        sx={{
          flexGrow: 1,
          backgroundColor: '#f5f5f5',
          padding: '16px',
          mt: 8, // Ensure space for the AppBar
        }}
      >
        <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to="/home" /> : <Login onLogin={handleLogin} />} />
          <Route path="/create-account" element={<CreateAccount />} />
          {isAuthenticated ? (
            <>
              <Route path="/home" element={<Home />} />
              <Route path="/add-car" element={<AddCar />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/add-expense-report" element={<AddExpenseReport />} />
              <Route path="/enter-details-manually" element={<EnterDetailsManually />} />
              <Route path="/view-deal/:vin" element={<ViewDeal />} />
              <Route path="/user-settings" element={<UserSettings />} /> {/* New User Settings route */}
              <Route path="/edit-car/:vin" element={<EditCar />} /> {/* Route for editing a car */}
              <Route path="/edit-report/:reportId" element={<EditReport />} />
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