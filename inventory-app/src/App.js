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
import HomeIcon from '@mui/icons-material/Home';
import InventoryIcon from '@mui/icons-material/Inventory';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import StorefrontIcon from '@mui/icons-material/Storefront';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import MonthlyReconditioning from './components/MonthlyReconditioning';
import UnsoldReconditioning from './components/UnsoldReconditioning';
import MonthlyProfits from './components/MonthlyProfits';
import AssignmentIcon from '@mui/icons-material/Assignment';
import Tasks from './components/Tasks';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import Expenses from './components/Expenses';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import Deposits from './components/Deposits';

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
    color: 'white',
    borderLeft: '4px solid transparent',
    '&.Mui-selected': {
      backgroundColor: 'transparent',
      borderLeft: '4px solid #4285f4',
      color: '#4285f4',
      '& .MuiListItemIcon-root': {
        color: '#4285f4',
      },
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
      }
    },
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
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
            <Drawer
              variant="permanent"
              sx={{
                width: 80,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                  width: 80,
                  boxSizing: 'border-box',
                  background: '#2f4050',
                  overflowX: 'hidden',
                  mt: '80px',
                  p: 0,
                  m: 0,
                  '& .MuiList-root': {
                    p: 0,
                    m: 0
                  }
                }
              }}
            >
              <List sx={{ p: 0, m: 0 }}>
                {isAuthenticated ? (
                  <>
                    <ListItem 
                      button 
                      onClick={() => navigate('/home')} 
                      selected={location.pathname === '/home'}
                      sx={{
                        ...menuItemStyle,
                        flexDirection: 'column',
                        height: 80,
                        justifyContent: 'center',
                        p: 0,
                        m: 0
                      }}
                    >
                      <HomeIcon />
                      <Typography variant="caption" sx={{ mt: 0.5, fontSize: '0.7rem' }}>
                        Home
                      </Typography>
                    </ListItem>

                    <ListItem 
                      button 
                      onClick={() => navigate('/add-car')} 
                      selected={location.pathname === '/add-car'}
                      sx={{
                        ...menuItemStyle,
                        flexDirection: 'column',
                        height: 80,
                        justifyContent: 'center',
                        p: 0,
                        m: 0
                      }}
                    >
                      <DirectionsCarIcon />
                      <Typography variant="caption" sx={{ mt: 0.5, fontSize: '0.7rem' }}>
                        Add Vehicle
                      </Typography>
                    </ListItem>

                    <ListItem 
                      button 
                      onClick={() => navigate('/inventory')} 
                      selected={location.pathname === '/inventory'}
                      sx={{
                        ...menuItemStyle,
                        flexDirection: 'column',
                        height: 80,
                        justifyContent: 'center',
                        p: 0,
                        m: 0
                      }}
                    >
                      <InventoryIcon />
                      <Typography variant="caption" sx={{ mt: 0.5, fontSize: '0.7rem' }}>
                        Inventory
                      </Typography>
                    </ListItem>

                    <ListItem 
                      button 
                      onClick={() => navigate('/tasks')} 
                      selected={location.pathname === '/tasks'}
                      sx={{
                        ...menuItemStyle,
                        flexDirection: 'column',
                        height: 80,
                        justifyContent: 'center',
                        p: 0,
                        m: 0
                      }}
                    >
                      <AssignmentIcon />
                      <Typography variant="caption" sx={{ mt: 0.5, fontSize: '0.7rem' }}>
                        Tasks
                      </Typography>
                    </ListItem>

                    <ListItem 
                      button 
                      onClick={() => navigate('/user-settings')} 
                      selected={location.pathname === '/user-settings'}
                      sx={{
                        ...menuItemStyle,
                        flexDirection: 'column',
                        height: 80,
                        justifyContent: 'center',
                        p: 0,
                        m: 0
                      }}
                    >
                      <AccountCircleIcon />
                      <Typography variant="caption" sx={{ mt: 0.5, fontSize: '0.7rem' }}>
                        My Account
                      </Typography>
                    </ListItem>

                    <ListItem 
                      button 
                      onClick={() => navigate('/expenses')} 
                      selected={location.pathname === '/expenses'}
                      sx={{
                        ...menuItemStyle,
                        flexDirection: 'column',
                        height: 80,
                        justifyContent: 'center',
                        p: 0,
                        m: 0
                      }}
                    >
                      <AccountBalanceWalletIcon />
                      <Typography variant="caption" sx={{ mt: 0.5, fontSize: '0.7rem' }}>
                        Admin Costs
                      </Typography>
                    </ListItem>

                    <ListItem 
                      button 
                      onClick={() => navigate('/deposits')} 
                      selected={location.pathname === '/deposits'}
                      sx={{
                        ...menuItemStyle,
                        flexDirection: 'column',
                        height: 80,
                        justifyContent: 'center',
                        p: 0,
                        m: 0
                      }}
                    >
                      <AccountBalanceIcon />
                      <Typography variant="caption" sx={{ mt: 0.5, fontSize: '0.7rem' }}>
                        Deposits
                      </Typography>
                    </ListItem>

                    <ListItem 
                      button 
                      onClick={handleLogout}
                      sx={{
                        ...menuItemStyle,
                        flexDirection: 'column',
                        height: 80,
                        justifyContent: 'center',
                        p: 0,
                        m: 0
                      }}
                    >
                      <LogoutIcon />
                      <Typography variant="caption" sx={{ mt: 0.5, fontSize: '0.7rem' }}>
                        Logout
                      </Typography>
                    </ListItem>
                  </>
                ) : (
                  <>
                    <ListItem 
                      button 
                      onClick={() => navigate('/')}
                      selected={location.pathname === '/'}
                      sx={{
                        ...menuItemStyle,
                        flexDirection: 'column',
                        height: 80,
                        justifyContent: 'center',
                        p: 0,
                        m: 0
                      }}
                    >
                      <AttachMoneyIcon />
                      <Typography variant="caption" sx={{ mt: 0.5, fontSize: '0.7rem' }}>
                        DealCost
                      </Typography>
                    </ListItem>

                    <ListItem 
                      button 
                      onClick={() => navigate('/login')}
                      selected={location.pathname === '/login'}
                      sx={{
                        ...menuItemStyle,
                        flexDirection: 'column',
                        height: 80,
                        justifyContent: 'center',
                        p: 0,
                        m: 0
                      }}
                    >
                      <LoginIcon />
                      <Typography variant="caption" sx={{ mt: 0.5, fontSize: '0.7rem' }}>
                        Login
                      </Typography>
                    </ListItem>

                    <ListItem 
                      button 
                      onClick={() => navigate('/create-account')}
                      selected={location.pathname === '/create-account'}
                      sx={{
                        ...menuItemStyle,
                        flexDirection: 'column',
                        height: 80,
                        justifyContent: 'center',
                        p: 0,
                        m: 0
                      }}
                    >
                      <PersonAddIcon />
                      <Typography variant="caption" sx={{ mt: 0.5, fontSize: '0.7rem' }}>
                        Create
                      </Typography>
                    </ListItem>
                  </>
                )}
              </List>
            </Drawer>

            <AppBar
              position="fixed"
              sx={{
                width: 'calc(100% - 80px)',  // Full width minus sidebar width
                background: '#4285f4',
                height: '80px',
                p: 0,
                m: 0,
                left: '80px',  // Start after the sidebar
              }}
            >
              <Toolbar sx={{ 
                minHeight: '80px',
                height: '80px',
                p: 0,
                m: 0
              }}>
                <Typography 
                  variant="h6" 
                  component="div" 
                  sx={{ 
                    flexGrow: 1,
                    fontSize: { xs: '1.2rem', sm: '1.4rem' },
                    fontWeight: 600,
                    color: 'white',
                    p: 0,
                    m: 0
                  }}
                >
                  {companyName || localStorage.getItem('company_name')}
                </Typography>
              </Toolbar>
            </AppBar>
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
                <Route path="/monthly-reconditioning" element={<MonthlyReconditioning />} />
                <Route path="/unsold-reconditioning" element={<UnsoldReconditioning />} />
                <Route path="/monthly-profits" element={<MonthlyProfits />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/deposits" element={<Deposits />} />
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