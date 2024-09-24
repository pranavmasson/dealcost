import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Typography, Box, Card, CardContent } from '@mui/material';

function UserSettings() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    company_name: '',
    phone_number: '',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchUserDetails = async () => {
      const userId = localStorage.getItem('userToken');
      if (userId) {
        try {
          const response = await fetch(`http://127.0.0.1:5000/api/user/${userId}`);
          const data = await response.json();
          if (response.ok) {
            setFormData({
              username: data.username,
              email: data.email,
              company_name: data.company_name,
              phone_number: data.phone_number || '',
            });
          } else {
            setMessage('Failed to load user details');
          }
        } catch (error) {
          setMessage('Error fetching user details');
          console.error('Error:', error);
        }
      }
    };

    fetchUserDetails();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('userToken');  // Get userId from localStorage

    if (userId) {
      try {
        const response = await fetch(`http://127.0.0.1:5000/api/user/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),  // Assuming formData has the updated user data
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setMessage('Changes were saved successfully!');
        console.log(data.message);  // Check for the success message from the server
      } catch (error) {
        setMessage('Error updating user');
        console.error('Error updating user:', error);
      }
    } else {
      console.error('User ID is not available in local storage');
    }
};

  return (
    <Container maxWidth="sm">
      <Box mt={5}>
        <Typography variant="h4" component="h1" gutterBottom>
          User Settings
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            margin="normal"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            margin="normal"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <TextField
            label="Company Name"
            variant="outlined"
            fullWidth
            margin="normal"
            name="company_name"
            value={formData.company_name}
            onChange={handleChange}
            required
          />
          <TextField
            label="Phone Number"
            variant="outlined"
            fullWidth
            margin="normal"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
          />
          <Button variant="contained" color="primary" type="submit" fullWidth>
            Save Changes
          </Button>
        </form>

        {/* Show success message as a card */}
        {message && (
          <Box mt={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="primary">
                  {message}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default UserSettings;