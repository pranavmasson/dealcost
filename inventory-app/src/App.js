import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Login from './components/Login';
import CreateAccount from './components/CreateAccount';
import AddCar from './components/AddCar';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';

function App() {
  return (
    <Router>
      <div>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Inventory Management
            </Typography>
            <Button color="inherit" component={Link} to="/login">Login</Button>
            <Button color="inherit" component={Link} to="/create-account">Create Account</Button>
            <Button color="inherit" component={Link} to="/add-car">Add Car</Button>
          </Toolbar>
        </AppBar>
        <Container>
          <Box mt={4}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/create-account" element={<CreateAccount />} />
              <Route path="/add-car" element={<AddCar />} />
            </Routes>
          </Box>
        </Container>
      </div>
    </Router>
  );
}

export default App;
