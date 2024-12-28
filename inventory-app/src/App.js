import React, { useState, useEffect } from 'react';
import { Route, Routes, Navigate, useNavigate, useLocation } from 'react-router-dom';
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
import { ThemeProvider } from '@mui/material/styles';
import { lightTheme, darkTheme } from './theme';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import InventoryIcon from '@mui/icons-material/Inventory';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import StorefrontIcon from '@mui/icons-material/Storefront';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [open, setOpen] = useState(false); // State to handle sidebar collapse/expand
  const [companyName, setCompanyName] = useState('');
  const navigate = useNavigate();
  const location = useLocation(); // Add this import from react-router-dom
  const isOnSplashScreen = location.pathname === '/';
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Fetch token and company name from localStorage on component mount
  useEffect(() => {
    const username = localStorage.getItem('username');
    const storedCompanyName = localStorage.getItem('company_name');
    console.log('Initial load - stored company name:', storedCompanyName);
    console.log('Initial load - username:', username);
    
    if (storedCompanyName) {
      console.log('Setting company name to:', storedCompanyName);
      setCompanyName(storedCompanyName);
    }
    if (username) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (user_id) => {
    const username = localStorage.getItem('username');
    const company_name = localStorage.getItem('company_name');
    
    if (!username || !company_name) {
      console.error('Missing user data in localStorage');
      return;
    }
    
    setCompanyName(company_name);
    setIsAuthenticated(true);
    navigate('/home');
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

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const menuItemStyle = {
    my: 0.5,
    mx: 1,
    borderRadius: 1,
    color: 'rgba(255, 255, 255, 0.9)',
    transition: 'all 0.3s ease',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.08)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    }
  };

  console.log('API URL:', process.env.REACT_APP_API_URL);

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <CssBaseline />

        {/* Only render AppBar and Drawer if not on splash screen */}
        {!isOnSplashScreen && (
          <>
            <AppBar
              position="fixed"
              sx={{
                width: open ? `calc(100% - 240px)` : '100%',
                ml: open ? `240px` : 0,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                background: 'rgba(13, 71, 161, 0.95)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
              }}
            >
              <Toolbar sx={{ minHeight: '64px' }}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    onClick={toggleDrawer}
                    edge="start"
                    sx={{ 
                      mr: 2,
                      color: 'rgba(255, 255, 255, 0.9)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(5px)',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.1)',
                      },
                      ...(open && { display: 'none' })
                    }}
                  >
                    <MenuIcon />
                  </IconButton>
                </motion.div>

                {isAuthenticated && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    style={{ flexGrow: 1 }}
                  >
                    <Typography 
                      variant="h6" 
                      component="div" 
                      sx={{ 
                        textAlign: 'left',
                        fontSize: { xs: '1.2rem', sm: '1.4rem' },
                        fontWeight: 800,
                        ml: 2,
                        letterSpacing: '0.5px',
                        background: 'linear-gradient(90deg, #fff 0%, #64B5F6 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textShadow: '0 0 30px rgba(100,181,246,0.2)',
                        transition: 'all 0.4s ease',
                        '&:hover': {
                          letterSpacing: '1px',
                          background: 'linear-gradient(90deg, #fff 30%, #90CAF9 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }
                      }}
                    >
                      {companyName || localStorage.getItem('company_name')}
                    </Typography>
                  </motion.div>
                )}
              </Toolbar>
            </AppBar>

            <Drawer
              variant="permanent"
              open={open}
              sx={{
                width: open ? 240 : 70,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                  width: open ? 240 : 70,
                  boxSizing: 'border-box',
                  background: 'rgba(13, 71, 161, 0.95)',
                  backdropFilter: 'blur(12px)',
                  borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                  transition: 'width 0.3s ease',
                  overflowX: 'hidden',
                },
                '& .MuiList-root': {
                  overflowX: 'hidden',
                  width: '100%',
                },
                '& .MuiListItem-root': {
                  width: 'auto',
                  minWidth: open ? '240px' : '70px',
                }
              }}
            >
              <Toolbar>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <IconButton onClick={toggleDrawer} sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    {open ? <ChevronLeftIcon /> : <MenuIcon />}
                  </IconButton>
                </motion.div>
              </Toolbar>
              <Box sx={{ 
                overflowX: 'hidden',
                overflowY: 'auto',
                width: '100%',
              }}>
                <List sx={{ width: '100%' }}>
                  <ListItem
                    button
                    onClick={() => navigate('/')}
                    sx={{
                      mb: 2,
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: 1,
                      mx: 1,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.08)',
                        transform: 'translateX(5px)',
                      }
                    }}
                  >
                    <StorefrontIcon sx={{ mr: open ? 2 : 0, color: '#90CAF9' }} />
                    <Typography variant="h6" component="div" sx={{ 
                      flexGrow: 1, 
                      display: open ? 'block' : 'none',
                      background: 'linear-gradient(90deg, #fff 0%, #90CAF9 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}>
                      DealCost
                    </Typography>
                  </ListItem>

                  {!isAuthenticated ? (
                    <>
                      <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                        <ListItem button onClick={() => navigate('/login')} sx={menuItemStyle}>
                          <LoginIcon sx={{ mr: open ? 2 : 0, color: '#90CAF9' }} />
                          <ListItemText primary="Login" sx={{ display: open ? 'block' : 'none' }} />
                        </ListItem>
                      </motion.div>

                      <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                        <ListItem button onClick={() => navigate('/create-account')} sx={menuItemStyle}>
                          <PersonAddIcon sx={{ mr: open ? 2 : 0, color: '#90CAF9' }} />
                          <ListItemText primary="Create Account" sx={{ display: open ? 'block' : 'none' }} />
                        </ListItem>
                      </motion.div>
                    </>
                  ) : (
                    <>
                      <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                        <ListItem button onClick={() => navigate('/add-car')} sx={menuItemStyle}>
                          <DirectionsCarIcon sx={{ mr: open ? 2 : 0, color: '#90CAF9' }} />
                          <ListItemText primary="Add Car" sx={{ display: open ? 'block' : 'none' }} />
                        </ListItem>
                      </motion.div>

                      <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                        <ListItem button onClick={() => navigate('/inventory')} sx={menuItemStyle}>
                          <InventoryIcon sx={{ mr: open ? 2 : 0, color: '#90CAF9' }} />
                          <ListItemText primary="Inventory" sx={{ display: open ? 'block' : 'none' }} />
                        </ListItem>
                      </motion.div>

                      <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                        <ListItem button onClick={() => navigate('/home')} sx={menuItemStyle}>
                          <DashboardIcon sx={{ mr: open ? 2 : 0, color: '#90CAF9' }} />
                          <ListItemText primary="Dashboard" sx={{ display: open ? 'block' : 'none' }} />
                        </ListItem>
                      </motion.div>

                      <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                        <ListItem button onClick={() => navigate('/user-settings')} sx={menuItemStyle}>
                          <SettingsIcon sx={{ mr: open ? 2 : 0, color: '#90CAF9' }} />
                          <ListItemText primary="User Settings" sx={{ display: open ? 'block' : 'none' }} />
                        </ListItem>
                      </motion.div>

                      <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                        <ListItem button onClick={handleLogout} sx={menuItemStyle}>
                          <LogoutIcon sx={{ mr: open ? 2 : 0, color: '#90CAF9' }} />
                          <ListItemText primary="Logout" sx={{ display: open ? 'block' : 'none' }} />
                        </ListItem>
                      </motion.div>
                    </>
                  )}
                </List>
              </Box>
            </Drawer>
          </>
        )}

        {/* Main content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            ...(isOnSplashScreen ? { p: 0, m: 0 } : { p: 3, mt: 8 })
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
                <Route path="/user-settings" element={<UserSettings isDarkMode={isDarkMode} onThemeChange={toggleTheme} />} />
                <Route path="/edit-car/:vin" element={<EditCar />} /> {/* Route for editing a car */}
                <Route path="/edit-report/:reportId" element={<EditReport />} />
              </>
            ) : (
              <Route path="*" element={<Navigate to="/login" />} />
            )}
          </Routes>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;