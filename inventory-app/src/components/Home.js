import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Box, Typography, Button, Grid, Paper, CircularProgress,
  useTheme
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import AddIcon from '@mui/icons-material/Add';
import InventoryIcon from '@mui/icons-material/Inventory';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WarningIcon from '@mui/icons-material/Warning';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import StarIcon from '@mui/icons-material/Star';
import BuildIcon from '@mui/icons-material/Build';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import StorefrontIcon from '@mui/icons-material/Storefront';
import HandshakeIcon from '@mui/icons-material/Handshake';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function Home() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [dashboardData, setDashboardData] = useState({
    total_vehicles: 0,
    total_inventory_value: 0,
    current_month_profit: 0,
    current_month_reconditioning_cost: 0,
    total_reconditioning_cost: 0,
    total_floor_plan: 0,
    total_dealership: 0,
    total_consignment: 0,
    unsold_reconditioning_cost: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const username = localStorage.getItem('username');
        console.log('Stored username:', username);
        
        if (!username) {
          console.error('No username in localStorage');
          return;
        }

        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/dashboard?username=${username}`
        );
        const data = await response.json();
        console.log('Raw response:', response);
        console.log('Parsed data:', data);

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch dashboard data');
        }

        console.log('Setting dashboard data:', data);
        setDashboardData(data);
      } catch (err) {
        console.error('Dashboard Error:', err);
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
    labels: ['Floor Plan', 'Dealership', 'Consignment'],
    datasets: [{
      data: [
        dashboardData?.total_floor_plan || 0,
        dashboardData?.total_dealership || 0,
        dashboardData?.total_consignment || 0
      ],
      backgroundColor: [
        'rgba(45, 136, 255, 0.85)',    // Vibrant Blue
        'rgba(255, 92, 147, 0.85)',    // Vibrant Pink
        'rgba(255, 187, 51, 0.85)'     // Vibrant Gold
      ],
      hoverBackgroundColor: [
        'rgba(45, 136, 255, 1)',
        'rgba(255, 92, 147, 1)',
        'rgba(255, 187, 51, 1)'
      ],
      borderWidth: 3,
      borderColor: '#ffffff'
    }]
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        padding: {
          top: 8,
          right: 12,
          bottom: 8,
          left: 12
        },
        titleFont: {
          size: 12,
          weight: 'bold',
          family: "'Inter', sans-serif"
        },
        bodyFont: {
          size: 11,
          family: "'Inter', sans-serif"
        },
        callbacks: {
          label: function(tooltipItem) {
            const total = tooltipItem.dataset.data.reduce((sum, value) => sum + value, 0);
            const value = tooltipItem.raw;
            const percent = ((value / total) * 100).toFixed(1);
            return ` ${value} (${percent}%)`;
          }
        }
      },
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 11
          }
        }
      }
    },
    cutout: '70%'
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const buttonHoverVariants = {
    hover: {
      scale: 1.05,
      boxShadow: "0px 5px 15px rgba(0,0,0,0.2)",
      transition: {
        type: "spring",
        stiffness: 400
      }
    }
  };

  const calculateAverageDaysToSale = (inventory) => {
    const soldCars = inventory.filter(car => car.sale_status === 'sold');
    if (!soldCars.length) return '0';
    
    const totalDays = soldCars.reduce((sum, car) => {
      const purchaseDate = new Date(car.purchase_date);
      const saleDate = new Date(car.date_sold);
      return sum + Math.floor((saleDate - purchaseDate) / (1000 * 60 * 60 * 24));
    }, 0);
    
    return Math.round(totalDays / soldCars.length);
  };

  const countPendingTitles = (inventory) => {
    return inventory.filter(car => 
      car.title_received === 'no' && car.sale_status !== 'sold'
    ).length;
  };

  const calculateAverageMargin = (inventory) => {
    const soldCars = inventory.filter(car => car.sale_status === 'sold');
    if (!soldCars.length) return '0';
    
    const totalMargin = soldCars.reduce((sum, car) => {
      const profit = car.sale_price - car.purchase_price;
      return sum + (profit / car.purchase_price) * 100;
    }, 0);
    
    return Math.round(totalMargin / soldCars.length);
  };

  const calculateInventoryTurnover = (inventory) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentSales = inventory.filter(car => 
      car.sale_status === 'sold' && 
      new Date(car.date_sold) > thirtyDaysAgo
    ).length;
    
    return `${recentSales}/mo`;
  };

  const getTopMakes = (inventory) => {
    const makes = inventory.reduce((acc, car) => {
      acc[car.make] = (acc[car.make] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(makes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([make]) => make)
      .join(', ');
  };

  const countPendingInspections = (inventory) => {
    return inventory.filter(car => 
      car.inspection_received === 'no' && car.sale_status !== 'sold'
    ).length;
  };

  const getPriceDistributionData = (inventory) => {
    const priceRanges = [
      { min: 0, max: 10000, label: '0-10k' },
      { min: 10000, max: 20000, label: '10k-20k' },
      { min: 20000, max: 30000, label: '20k-30k' },
      { min: 30000, max: 40000, label: '30k-40k' },
      { min: 40000, max: 50000, label: '40k-50k' },
      { min: 50000, max: Infinity, label: '50k+' }
    ];

    const distribution = priceRanges.map(range => {
      return inventory.filter(car => 
        car.sale_price >= range.min && car.sale_price < range.max
      ).length;
    });

    return {
      labels: priceRanges.map(range => range.label),
      datasets: [{
        label: 'Number of Vehicles',
        data: distribution,
        backgroundColor: '#2196f3',
        borderColor: '#1976d2',
        borderWidth: 1,
      }]
    };
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <CircularProgress size={60} />
        </motion.div>
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
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Container maxWidth="lg" sx={{ px: { xs: 0.5, sm: 2 }, mb: { xs: 2, sm: 3 } }}>
        <Box mt={3} textAlign="center">
          <motion.div variants={itemVariants}>
            <Typography 
              variant="h4" 
              gutterBottom 
              sx={{ 
                fontWeight: 800,
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: { xs: 2, sm: 3 }
              }}
            >
              Welcome to Your Dashboard
            </Typography>
          </motion.div>

          <Box 
            mb={{ xs: 2, sm: 3 }} 
            display="flex" 
            flexDirection={{ xs: 'column', sm: 'row' }} 
            gap={{ xs: 1, sm: 1.5 }}
            px={{ xs: 1, sm: 0 }}
          >
            {[
              { text: 'View Inventory', icon: <InventoryIcon />, handler: handleViewInventory, color: '#36A2EB' },
              { text: 'Add New Car', icon: <AddIcon />, handler: handleAddCar, color: '#FF6384' },
              { text: 'Add Expense Report', icon: <ReceiptIcon />, handler: handleAddExpenseReport, color: '#FFCE56' }
            ].map((btn, index) => (
              <motion.div key={index} variants={itemVariants} style={{ width: '100%' }}>
                <Button
                  variant="contained"
                  onClick={btn.handler}
                  startIcon={btn.icon}
                  fullWidth
                  sx={{
                    background: `linear-gradient(45deg, ${btn.color} 30%, ${btn.color}99 90%)`,
                    color: 'white',
                    fontWeight: 'bold',
                    padding: { xs: '6px 12px', sm: '8px 16px', md: '12px 24px' },
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
                    minHeight: { xs: '40px', sm: '48px' },
                    '&:hover': {
                      background: `linear-gradient(45deg, ${btn.color} 30%, ${btn.color} 90%)`,
                    },
                  }}
                >
                  {btn.text}
                </Button>
              </motion.div>
            ))}
          </Box>

          <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ px: { xs: 0.5, sm: 2 } }}>
            {[
              {
                title: 'Active Inventory',
                value: `${dashboardData?.total_vehicles || 0} Vehicles`,
                color: '#2196F3',
                icon: <InventoryIcon sx={{ fontSize: 40, opacity: 0.7 }} />
              },
              {
                title: 'Active Inventory Value',
                value: `$${(dashboardData?.total_inventory_value || 0).toLocaleString()}`,
                color: '#FF6384',
                icon: <TrendingUpIcon sx={{ fontSize: 40, opacity: 0.7 }} />
              },
              {
                title: 'Monthly Reconditioning',
                value: `$${(dashboardData?.current_month_reconditioning_cost || 0).toLocaleString()}`,
                color: '#4CAF50',
                icon: <BuildIcon sx={{ fontSize: 40, opacity: 0.7 }} />
              },
              {
                title: 'Monthly Profit',
                value: `$${(dashboardData?.current_month_profit || 0).toLocaleString()}`,
                color: '#FFCE56',
                icon: <TrendingUpIcon sx={{ fontSize: 40, opacity: 0.7 }} />
              },
              {
                title: 'Floor Plan Vehicles',
                value: dashboardData?.total_floor_plan || 0,
                color: '#9C27B0',
                icon: <DirectionsCarIcon sx={{ fontSize: 40, opacity: 0.7 }} />
              },
              {
                title: 'Dealership Vehicles',
                value: dashboardData?.total_dealership || 0,
                color: '#F44336',
                icon: <StorefrontIcon sx={{ fontSize: 40, opacity: 0.7 }} />
              },
              {
                title: 'Consignment Vehicles',
                value: dashboardData?.total_consignment || 0,
                color: '#795548',
                icon: <HandshakeIcon sx={{ fontSize: 40, opacity: 0.7 }} />
              },
              {
                title: 'Reconditioning for Unsold Inventory',
                value: `$${(dashboardData?.unsold_reconditioning_cost || 0).toLocaleString()}`,
                color: '#607D8B',
                icon: <BuildIcon sx={{ fontSize: 40, opacity: 0.7 }} />
              }
            ].map((item, index) => (
              <Grid item xs={6} sm={6} md={3} key={index}>
                <motion.div variants={itemVariants}>
                  <Paper
                    elevation={0}
                    sx={{
                      padding: { xs: 1, sm: 1.5, md: 2 },
                      borderRadius: 2,
                      background: theme.palette.mode === 'dark' 
                        ? `linear-gradient(45deg, ${theme.palette.background.paper} 0%, ${item.color}22 100%)`
                        : `linear-gradient(45deg, #fff 0%, ${item.color}22 100%)`,
                      border: `1px solid ${item.color}33`,
                      transition: 'transform 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                      },
                      minHeight: { xs: '90px', sm: '120px' }
                    }}
                  >
                    <Box display="flex" alignItems="center" mb={0.5}>
                      <Box sx={{ color: item.color }}>
                        {React.cloneElement(item.icon, { sx: { fontSize: { xs: 20, sm: 24, md: 30 } } })}
                      </Box>
                    </Box>
                    <Typography 
                      variant="subtitle2" 
                      color="text.secondary"
                      sx={{ 
                        fontSize: { xs: '0.65rem', sm: '0.75rem', md: '0.9rem' },
                        mb: 0.5,
                        lineHeight: 1.2
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 700,
                        color: item.color,
                        fontSize: { xs: '0.85rem', sm: '1rem', md: '1.4rem' },
                        lineHeight: 1.2
                      }}
                    >
                      {item.value}
                    </Typography>
                  </Paper>
                </motion.div>
              </Grid>
            ))}

            <Grid item xs={12} md={6}>
              <motion.div variants={itemVariants}>
                <Paper
                  elevation={0}
                  sx={{
                    padding: { xs: 1, sm: 1.5, md: 2 },
                    borderRadius: 2,
                    height: { xs: '250px', sm: '300px', md: '350px' },
                    mb: { xs: 1.5, sm: 2 }
                  }}
                >
                  <Typography 
                    variant="h6" 
                    gutterBottom 
                    color="text.secondary"
                    sx={{ 
                      fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1.1rem' },
                      mb: { xs: 1, sm: 2 }
                    }}
                  >
                    Inventory Distribution
                  </Typography>
                  <Box sx={{ 
                    height: { xs: '200px', sm: '250px', md: '300px' },
                    width: '100%' 
                  }}>
                    <Pie data={pieData} options={pieOptions} />
                  </Box>
                </Paper>
              </motion.div>
            </Grid>

            <Grid item xs={12} md={6}>
              <motion.div variants={itemVariants}>
                <Paper
                  elevation={0}
                  sx={{
                    padding: { xs: 2, sm: 2 },
                    borderRadius: 3,
                    height: { xs: '250px', sm: '300px' }
                  }}
                >
                  <Typography 
                    variant="h6" 
                    gutterBottom 
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' } }}
                  >
                    Inventory Price Distribution
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <Bar data={getPriceDistributionData(dashboardData?.inventory || [])} options={barOptions} />
                  </Box>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </motion.div>
  );
}

export default Home;