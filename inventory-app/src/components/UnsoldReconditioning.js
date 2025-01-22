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
import BuildIcon from '@mui/icons-material/Build';

function UnsoldReconditioning() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reconditioning, setReconditioning] = useState([]);

  useEffect(() => {
    const fetchReconditioning = async () => {
      try {
        const username = localStorage.getItem('username');
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/reports/unsold?username=${username}`
        );
        const data = await response.json();

        if (response.ok) {
          setReconditioning(data.reconditioning);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError('Failed to fetch reconditioning data');
      } finally {
        setLoading(false);
      }
    };

    fetchReconditioning();
  }, []);

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

  const totalCost = reconditioning.reduce((sum, record) => sum + parseFloat(record.cost || 0), 0);

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
            <BuildIcon sx={{ fontSize: 40, color: '#607D8B', opacity: 0.7 }} />
            <Box>
              <Typography variant="h4" gutterBottom>
                Unsold Inventory Reconditioning
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Current Available Inventory
              </Typography>
            </Box>
          </Box>

          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Vehicle</TableCell>
                  <TableCell>VIN</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Cost</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reconditioning.map((record, index) => (
                  <TableRow key={index}>
                    <TableCell>{new Date(record.date_occurred).toLocaleDateString()}</TableCell>
                    <TableCell>{`${record.year} ${record.make} ${record.model}`}</TableCell>
                    <TableCell>{record.vin}</TableCell>
                    <TableCell>{record.description}</TableCell>
                    <TableCell align="right">${parseFloat(record.cost).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={4} sx={{ fontWeight: 'bold' }}>Total</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>${totalCost.toLocaleString()}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
    </motion.div>
  );
}

export default UnsoldReconditioning;
