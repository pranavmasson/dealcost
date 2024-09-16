import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Box, List, ListItem, ListItemText } from '@mui/material';

function ViewDeal() {
  const { vin } = useParams();  // Get the VIN from the URL parameter
  const [records, setRecords] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMaintenanceRecords = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/api/reports?vin=${vin}`);
        const data = await response.json();

        if (response.ok) {
          setRecords(data.records);
        } else {
          setError(data.error);
        }
      } catch (error) {
        console.error('Error fetching maintenance records:', error);
        setError('An error occurred while fetching maintenance records');
      }
    };

    fetchMaintenanceRecords();
  }, [vin]);

  return (
    <Container maxWidth="md">
      <Box mt={5}>
        <Typography variant="h4" gutterBottom>
          Maintenance Records for VIN: {vin}
        </Typography>
        {error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <List>
            {records.map((record) => (
              <ListItem key={record._id}>
                <ListItemText
                  primary={`Date: ${record.date_occurred}, Cost: $${record.cost}`}
                  secondary={`Category: ${record.category}, Location: ${record.location}, Notes: ${record.notes}`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Container>
  );
}

export default ViewDeal;