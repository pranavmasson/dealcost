import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Box, Grid, Card, CardContent, TextField, Button } from '@mui/material';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register chart elements
ChartJS.register(ArcElement, Tooltip, Legend);
ChartJS.register(ChartDataLabels);

function ViewDeal() {
  const { vin } = useParams();  // Get the VIN from the URL parameter
  const [records, setRecords] = useState([]);
  const [error, setError] = useState('');
  const [totalMaintenanceCost, setTotalMaintenanceCost] = useState(0);
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [salePrice, setSalePrice] = useState(0);

  // Fetch car details (purchase price, sale price) based on VIN
  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/api/inventory/${vin}`);  // API to get car details by VIN
        const data = await response.json();
        
        if (response.ok) {
          setPurchasePrice(data.purchase_price || 0);
          setSalePrice(data.sale_price || 0);
        } else {
          setError(data.error || 'Error fetching car details');
        }
      } catch (error) {
        console.error('Error fetching car details:', error);
        setError('Error fetching car details');
      }
    };

    fetchCarDetails();
  }, [vin]);

  useEffect(() => {
    const fetchMaintenanceRecords = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/api/reports?vin=${vin}`);
        const data = await response.json();

        if (response.ok) {
          setRecords(data.records);
          calculateTotalMaintenance(data.records);
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

  // Function to calculate the total maintenance cost
  const calculateTotalMaintenance = (records) => {
    const total = records.reduce((sum, record) => sum + parseFloat(record.cost), 0);
    setTotalMaintenanceCost(total);
  };

  // Handle delete record
  const handleDeleteRecord = async (recordId) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/delete_report`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: recordId }),
      });

      const data = await response.json();

      if (response.ok) {
        const updatedRecords = records.filter(record => record._id !== recordId);
        setRecords(updatedRecords);  // Update state to remove the deleted record
        calculateTotalMaintenance(updatedRecords);  // Recalculate total maintenance
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Error deleting record:', error);
      alert('An error occurred while deleting the record');
    }
  };

  // Prepare data for pie chart
  const categories = [...new Set(records.map(record => record.category))];
  const maintenanceCostsByCategory = categories.map(category =>
    records
      .filter(record => record.category === category)
      .reduce((sum, record) => sum + parseFloat(record.cost), 0)
  );

  const pieData = {
    labels: categories,
    datasets: [
      {
        label: 'Maintenance Costs by Category',
        data: maintenanceCostsByCategory,
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#66BB6A', '#EF5350', '#AB47BC'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#66BB6A', '#EF5350', '#AB47BC'],
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,  // Allow customization of chart size
    plugins: {
      tooltip: {
        callbacks: {
          label: function(tooltipItem) {
            const total = maintenanceCostsByCategory.reduce((sum, value) => sum + value, 0);
            const value = tooltipItem.raw;
            const percent = ((value / total) * 100).toFixed(2);
            return `${tooltipItem.label}: $${value} (${percent}%)`;
          }
        }
      },
      datalabels: {
        color: '#fff', // Label color
        formatter: (value) => `$${value}`, // Format labels to show as dollar amounts
        anchor: 'end',
        align: 'start',
        offset: -10,
        borderWidth: 2,
        borderColor: '#fff',
        borderRadius: 25,
        backgroundColor: (context) => context.dataset.backgroundColor,
        padding: 6
      },
      legend: {
        position: 'top',
      },
    },
  };
  
  return (
    <Container maxWidth="md">
      <Box mt={5}>
        <Typography variant="h4" gutterBottom>
          VIN: {vin}
        </Typography>

        <Box display="flex" flexDirection="column" alignItems="left">
          <Typography variant="h5" gutterBottom style={{ textAlign: 'left' }}>
            Maintenance Costs by Category
          </Typography>


          {/* Use Grid layout to keep the chart and inputs separate */}
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} style={{ height: '300px', width: '300px' }}>
              <Pie data={pieData} options={pieOptions} />
            </Grid>

            <Grid item xs={12} sm={6}>
              {/* Real-time Maintenance vs Sale Price Comparison */}
              <Typography variant="h5" gutterBottom>
                Cost Comparison
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Total Maintenance Cost"
                    value={totalMaintenanceCost}
                    fullWidth
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Purchase Price"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || 0)}
                    fullWidth
                    type="number"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Sale Price"
                    value={salePrice}
                    onChange={(e) => setSalePrice(parseFloat(e.target.value) || 0)}
                    fullWidth
                    type="number"
                  />
                </Grid>
              </Grid>
              <Box mt={3}>
                <Typography variant="h6">
                  Total Cost (Purchase + Maintenance): ${purchasePrice + totalMaintenanceCost}
                </Typography>
                <Typography variant="h6">
                  Difference (Sale Price - Total Cost): ${salePrice - (purchasePrice + totalMaintenanceCost)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {error && <Typography color="error">{error}</Typography>}
        
        <Grid container spacing={4} mt={5}>
          {records.map((record) => (
            <Grid item xs={12} sm={6} md={4} key={record._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Date: {record.date_occurred}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Cost:</strong> ${record.cost}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Category:</strong> {record.category}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Location:</strong> {record.location}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" style={{ marginTop: '10px', whiteSpace: 'pre-line' }}>
                    <strong>Notes:</strong> {record.notes || 'No additional notes'}
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="secondary" 
                    onClick={() => handleDeleteRecord(record._id)}
                    style={{ marginTop: '20px' }}  // Added extra margin to the button
                  >
                    Delete Record
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
}

export default ViewDeal;