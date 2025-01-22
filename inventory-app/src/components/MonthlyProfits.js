import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  alpha,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useTheme } from '@mui/material/styles';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

function MonthlyProfits() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [soldVehicles, setSoldVehicles] = useState([]);
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchSoldVehicles = async () => {
      try {
        const username = localStorage.getItem('username');
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/reports/monthly-profits?username=${username}&month=${currentMonth}&year=${currentYear}`
        );
        const data = await response.json();

        if (response.ok) {
          setSoldVehicles(data.vehicles);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError('Failed to fetch monthly profits data');
      } finally {
        setLoading(false);
      }
    };

    fetchSoldVehicles();
  }, [currentMonth, currentYear]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" align="center" mt={5}>
        {error}
      </Typography>
    );
  }

  const totalProfit = soldVehicles.reduce((sum, vehicle) => sum + vehicle.profit, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            background: theme => `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          }}
        >
          <Box display="flex" alignItems="center" gap={2} mb={4}>
            <TrendingUpIcon sx={{ fontSize: 40, color: '#FFB74D', opacity: 0.7 }} />
            <Box>
              <Typography variant="h4" gutterBottom>
                Monthly Profits
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {currentMonth} {currentYear}
              </Typography>
            </Box>
          </Box>

          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Vehicle</TableCell>
                  <TableCell>VIN</TableCell>
                  <TableCell align="right">Purchase Price</TableCell>
                  <TableCell align="right">Sale Price</TableCell>
                  <TableCell align="right">Reconditioning</TableCell>
                  <TableCell align="right">Profit</TableCell>
                  <TableCell>Sale Type</TableCell>
                  <TableCell>Purchaser</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {soldVehicles.map((vehicle) => (
                  <TableRow key={vehicle.vin}>
                    <TableCell>{`${vehicle.year} ${vehicle.make} ${vehicle.model}`}</TableCell>
                    <TableCell>{vehicle.vin}</TableCell>
                    <TableCell align="right">${parseFloat(vehicle.purchase_price).toLocaleString()}</TableCell>
                    <TableCell align="right">${parseFloat(vehicle.sale_price).toLocaleString()}</TableCell>
                    <TableCell align="right">${parseFloat(vehicle.reconditioning_cost).toLocaleString()}</TableCell>
                    <TableCell 
                      align="right"
                      sx={{ 
                        color: vehicle.profit >= 0 ? 'success.main' : 'error.main',
                        fontWeight: 'bold'
                      }}
                    >
                      ${vehicle.profit.toLocaleString()}
                    </TableCell>
                    <TableCell>{vehicle.sale_type}</TableCell>
                    <TableCell>{vehicle.purchaser}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={5} sx={{ fontWeight: 'bold' }}>Total Profit</TableCell>
                  <TableCell 
                    align="right" 
                    sx={{ 
                      fontWeight: 'bold',
                      color: totalProfit >= 0 ? 'success.main' : 'error.main'
                    }}
                  >
                    ${totalProfit.toLocaleString()}
                  </TableCell>
                  <TableCell colSpan={2} />
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
    </motion.div>
  );
}

export default MonthlyProfits;
