import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Paper,
  CircularProgress,
} from '@mui/material';
import { Pie } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { motion } from 'framer-motion';

ChartJS.register(ArcElement, Tooltip, Legend);

function Home() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const username = localStorage.getItem('username');
        const response = await fetch(
          `http://127.0.0.1:5000/api/dashboard?username=${username}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch dashboard data');
        }

        setDashboardData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleViewInventory = () => navigate('/inventory');
  const handleAddCar = () => navigate('/add-car');
  const handleAddExpenseReport = () => navigate('/add-expense-report');

  const pieData = {
    labels: ['Floor', 'Dealer', 'Consignment'],
    datasets: [
      {
        data: [
          dashboardData?.total_floor_plan || 0,
          dashboardData?.total_dealership || 0,
          dashboardData?.total_consignment || 0,
        ],
        backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56'],
        hoverBackgroundColor: ['#36A2EB', '#FF6384', '#FFCE56'],
        borderWidth: 2,
      },
    ],
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  if (error)
    return (
      <Typography color="error" align="center" mt={5}>
        {error}
      </Typography>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container maxWidth="lg">
        <Box mt={5} textAlign="center">
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            Welcome to Your Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" mb={4}>
            Monitor your inventory, profits, and key metrics at a glance.
          </Typography>

          <Box mb={4} display="flex" justifyContent="center" gap={2}>
            <Button
              variant="outlined"
              onClick={handleViewInventory}
              sx={{
                border: '2px solid #36A2EB', // Blue border
                color: '#36A2EB', // Blue text
                fontWeight: 'bold', // Bold text
                textTransform: 'uppercase', // Capitalize text
                padding: '8px 16px', // Make buttons blocky
                '&:hover': {
                  backgroundColor: 'rgba(54, 162, 235, 0.1)', // Light blue hover effect
                  borderColor: '#1E88E5', // Darker blue border on hover
                },
              }}
            >
              View Inventory
            </Button>
            <Button
              variant="outlined"
              onClick={handleAddCar}
              sx={{
                border: '2px solid #FF6384', // Pink border
                color: '#FF6384', // Pink text
                fontWeight: 'bold',
                textTransform: 'uppercase',
                padding: '8px 16px',
                '&:hover': {
                  backgroundColor: 'rgba(255, 99, 132, 0.1)', // Light pink hover effect
                  borderColor: '#E53935', // Darker pink border on hover
                },
              }}
            >
              Add New Car
            </Button>
            <Button
              variant="outlined"
              onClick={handleAddExpenseReport}
              sx={{
                border: '2px solid #FFCE56', // Yellow border
                color: '#FFCE56', // Yellow text
                fontWeight: 'bold',
                textTransform: 'uppercase',
                padding: '8px 16px',
                '&:hover': {
                  backgroundColor: 'rgba(255, 206, 86, 0.1)', // Light yellow hover effect
                  borderColor: '#F9A825', // Darker yellow border on hover
                },
              }}
            >
              Add Expense Report
            </Button>
          </Box>


          <Grid container spacing={4}>
            {[
              {
                title: 'Active Inventory',
                value: `${dashboardData?.total_vehicles || 0} Vehicles`,
              },
              {
                title: 'Active Inventory Value',
                value: `$${(
                  dashboardData?.total_inventory_value || 0
                ).toFixed(2)}`,
              },
              {
                title: 'Current Month Reconditioning Cost',
                value: `$${(
                  dashboardData?.current_month_reconditioning_cost || 0
                ).toFixed(2)}`,
              },
              {
                title: 'Current Month Gross Profit',
                value: `$${(dashboardData?.current_month_profit || 0).toFixed(
                  2
                )}`,
              },
            ].map((item, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Paper
                  elevation={4}
                  sx={{
                    padding: 3,
                    borderRadius: 2,
                    textAlign: 'center',
                    backgroundColor: '#f9f9f9',
                  }}
                >
                  <Typography variant="h6" color="text.secondary">
                    {item.title}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {item.value}
                  </Typography>
                </Paper>
              </Grid>
            ))}

            <Grid item xs={12} sm={6}>
              <Paper
                elevation={4}
                sx={{
                  padding: 3,
                  borderRadius: 2,
                  textAlign: 'center',
                  backgroundColor: '#f9f9f9',
                }}
              >
                <Typography variant="h6" gutterBottom color="text.secondary">
                  Inventory Distribution
                </Typography>
                <Box sx={{ width: '100%', height: '300px', margin: '0 auto' }}>
                  <Pie data={pieData} />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </motion.div>
  );
}

export default Home;