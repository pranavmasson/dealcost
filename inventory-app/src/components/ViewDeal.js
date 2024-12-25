import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Modal,
} from '@mui/material';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { motion, AnimatePresence } from 'framer-motion';
import { alpha } from '@mui/material/styles';
import TimelineIcon from '@mui/icons-material/Timeline';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';
import AddIcon from '@mui/icons-material/Add';
import EnterDetailsManually from './EnterDetailsManually';

ChartJS.register(ArcElement, Tooltip, Legend);
ChartJS.register(ChartDataLabels);

function ViewDeal() {
  const { vin } = useParams();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [error, setError] = useState('');
  const [totalMaintenanceCost, setTotalMaintenanceCost] = useState(0);
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [salePrice, setSalePrice] = useState(0);
  const [yearMakeModel, setYearMakeModel] = useState({ year: '', make: '', model: '' });
  const [manualEntryOpen, setManualEntryOpen] = useState(false);

  const handlePrint = () => {
    setTimeout(() => {
      const chartCanvas = document.querySelector('canvas.chartjs-render-monitor') || 
                         document.querySelector('canvas') ||
                         document.querySelector('.Pie canvas');
      
      let chartImage = null;
      
      if (chartCanvas) {
        try {
          chartImage = chartCanvas.toDataURL('image/png');
        } catch (error) {
          console.error('Error capturing chart:', error);
        }
      }

      const printWindow = window.open('', '', 'width=800,height=600');
      printWindow.document.write(`
        <html>
          <head>
            <title>Maintenance Report</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                margin: 40px 50px;
                color: #333;
                line-height: 1.4;
              }
              .header { 
                text-align: center;
                margin-bottom: 20px;
              }
              .header h1 { 
                font-size: 24px; 
                color: #2196F3;
                margin: 0;
                padding-bottom: 5px;
              }
              .header h2 { 
                font-size: 18px;
                margin: 5px 0;
                color: #555;
                text-transform: capitalize;
              }
              .header p {
                margin: 5px 0;
                color: #666;
              }
              .divider {
                border-bottom: 2px solid #2196F3;
                margin: 10px 0;
              }
              .content-grid {
                display: grid;
                grid-template-columns: 60% 40%;
                gap: 20px;
                margin-bottom: 20px;
              }
              .summary-box {
                background: #f8f9fa;
                border: 1px solid #e9ecef;
                border-radius: 4px;
                padding: 15px;
              }
              .summary-box h3 {
                font-size: 16px;
                margin: 0 0 10px 0;
                color: #444;
              }
              .summary-item {
                display: flex;
                justify-content: space-between;
                margin: 5px 0;
                font-size: 13px;
              }
              .chart-container {
                text-align: center;
              }
              .chart-container h3 {
                font-size: 16px;
                margin: 0 0 10px 0;
                color: #444;
              }
              .chart-image {
                width: 200px;
                height: auto;
              }
              table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-top: 20px;
                font-size: 12px;
              }
              th { 
                background-color: #f0f0f0;
                color: #333;
                font-weight: bold;
                text-align: left;
                padding: 8px;
                border: 1px solid #ddd;
              }
              td { 
                padding: 8px;
                border: 1px solid #ddd;
              }
              tr:nth-child(even) { 
                background-color: #f9f9f9;
              }
              .total-row {
                font-weight: bold;
                background-color: #f0f0f0 !important;
              }
              @page {
                margin: 0.5cm;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Vehicle Maintenance Report</h1>
              <h2>${yearMakeModel.year} ${yearMakeModel.make} ${yearMakeModel.model}</h2>
              <p>VIN: ${vin}</p>
            </div>
            <div class="divider"></div>
            
            <div class="content-grid">
              <div class="summary-box">
                <h3>Financial Summary</h3>
                <div class="summary-item">
                  <span>Purchase Price:</span>
                  <span>$${purchasePrice.toFixed(2)}</span>
                </div>
                <div class="summary-item">
                  <span>Total Maintenance Cost:</span>
                  <span>$${totalMaintenanceCost.toFixed(2)}</span>
                </div>
                <div class="summary-item">
                  <span>Total Investment:</span>
                  <span>$${(purchasePrice + totalMaintenanceCost).toFixed(2)}</span>
                </div>
                <div class="summary-item">
                  <span>Sale Price:</span>
                  <span>$${salePrice.toFixed(2)}</span>
                </div>
                <div class="summary-item" style="margin-top: 10px; font-weight: bold;">
                  <span>Gross Profit:</span>
                  <span>$${(salePrice - (purchasePrice + totalMaintenanceCost)).toFixed(2)}</span>
                </div>
              </div>

              ${chartImage ? `
                <div class="chart-container">
                  <h3>Cost Breakdown</h3>
                  <img src="${chartImage}" class="chart-image" alt="Cost Breakdown Chart"/>
                </div>
              ` : ''}
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Vendor</th>
                  <th>Description</th>
                  <th>Cost</th>
                </tr>
              </thead>
              <tbody>
                ${records.map(record => `
                  <tr>
                    <td>${record.date_occurred || 'N/A'}</td>
                    <td>${record.category || 'N/A'}</td>
                    <td>${record.service_provider || 'N/A'}</td>
                    <td>${record.notes || 'N/A'}</td>
                    <td>$${record.cost || '0.00'}</td>
                  </tr>
                `).join('')}
                <tr class="total-row">
                  <td colspan="4" style="text-align: right;">Total Maintenance Cost:</td>
                  <td>$${totalMaintenanceCost.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </body>
        </html>
      `);

      printWindow.document.close();
      printWindow.addEventListener('load', () => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      });
    }, 500);
  };
  

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/inventory/${vin}`);
        const data = await response.json();

        if (response.ok) {
          setPurchasePrice(data.purchase_price || 0);
          setSalePrice(data.sale_price || 0);
          setYearMakeModel({ year: data.year, make: data.make, model: data.model });
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
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/reports?vin=${vin}`);
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

  const calculateTotalMaintenance = (records) => {
    const total = records.reduce((sum, record) => sum + parseFloat(record.cost), 0);
    setTotalMaintenanceCost(total);
  };

  const handleDeleteRecord = async (recordId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/delete_report`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: recordId }),
      });

      const data = await response.json();

      if (response.ok) {
        const updatedRecords = records.filter((record) => record._id !== recordId);
        setRecords(updatedRecords);
        calculateTotalMaintenance(updatedRecords);
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Error deleting record:', error);
      alert('An error occurred while deleting the record');
    }
  };

  const handleEditRecord = (recordId) => {
    navigate(`/edit-report/${recordId}`);
  };

  const handleAddExpenseReport = () => {
    setManualEntryOpen(true);
  };

  const categories = [...new Set(records.map((record) => record.category))];
  const maintenanceCostsByCategory = categories.map((category) =>
    records
      .filter((record) => record.category === category)
      .reduce((sum, record) => sum + parseFloat(record.cost), 0)
  );

  const pieData = {
    labels: categories,
    datasets: [
      {
        data: maintenanceCostsByCategory,
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',   // Blue
          'rgba(255, 99, 132, 0.8)',   // Pink
          'rgba(255, 206, 86, 0.8)',   // Yellow
          'rgba(75, 192, 192, 0.8)',   // Teal
          'rgba(153, 102, 255, 0.8)',  // Purple
          'rgba(255, 159, 64, 0.8)',   // Orange
          'rgba(46, 204, 113, 0.8)',   // Green
          'rgba(142, 68, 173, 0.8)',   // Dark Purple
          'rgba(241, 196, 15, 0.8)',   // Yellow
          'rgba(231, 76, 60, 0.8)'     // Red
        ],
        hoverBackgroundColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(46, 204, 113, 1)',
          'rgba(142, 68, 173, 1)',
          'rgba(241, 196, 15, 1)',
          'rgba(231, 76, 60, 1)'
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  };

  const pieOptions = {
    plugins: {
      tooltip: {
        enabled: true,
        borderWidth: 1,
        callbacks: {
          label: function(tooltipItem) {
            const total = maintenanceCostsByCategory.reduce((sum, value) => sum + value, 0);
            const value = tooltipItem.raw;
            const percent = ((value / total) * 100).toFixed(1);
            return `$${value.toFixed(2)} (${percent}%)`;
          },
          title: function(tooltipItems) {
            return tooltipItems[0].label;
          }
        }
      },
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          font: {
            size: 13
          },
          generateLabels: function(chart) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              const total = data.datasets[0].data.reduce((sum, value) => sum + value, 0);
              return data.labels.map((label, i) => {
                const value = data.datasets[0].data[i];
                const percent = ((value / total) * 100).toFixed(1);
                return {
                  text: `${label} - $${value.toFixed(2)} (${percent}%)`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  hidden: isNaN(data.datasets[0].data[i]),
                  lineCap: 'round',
                  lineDash: [],
                  lineDashOffset: 0,
                  lineJoin: 'round',
                  lineWidth: 1,
                  strokeStyle: '#fff',
                  pointStyle: 'circle',
                  index: i
                };
              });
            }
            return [];
          }
        }
      },
      datalabels: {
        color: '#fff',
        font: {
          weight: 'bold',
          size: 11
        },
        formatter: (value, ctx) => {
          const total = ctx.dataset.data.reduce((sum, val) => sum + val, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return percentage > 5 ? `${percentage}%` : ''; // Only show label if segment is > 5%
        },
        anchor: 'center',
        align: 'center',
        offset: 0,
        padding: 0
      }
    },
    elements: {
      arc: {
        borderWidth: 2,
        borderColor: '#fff'
      }
    },
    cutout: '65%', // Slightly larger hole for better text visibility
    animation: {
      animateScale: true,
      animateRotate: true
    },
    layout: {
      padding: 20
    },
    plugins: [{
      id: 'centerText',
      beforeDraw: function(chart) {
        const width = chart.width;
        const height = chart.height;
        const ctx = chart.ctx;
        ctx.restore();

        // Calculate total
        const total = chart.data.datasets[0].data.reduce((sum, value) => sum + value, 0);
        
        // Font settings
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';

        // Draw "Total" text
        ctx.font = '14px Arial';
        ctx.fillStyle = '#666';
        ctx.fillText('Total', width / 2, (height / 2) - 15);

        // Draw total amount
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = '#333';
        ctx.fillText(`$${total.toFixed(2)}`, width / 2, (height / 2) + 15);

        ctx.save();
      }
    }]
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Container maxWidth="lg">
        <Box mt={5}>
          {/* Header Section */}
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 3,
                background: theme => `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Typography variant="h4" gutterBottom sx={{ 
                    fontWeight: 700,
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    {`${yearMakeModel.year} ${yearMakeModel.make.toUpperCase()} ${yearMakeModel.model.toUpperCase()}`}
                  </Typography>
                  <Typography variant="h6" color="textSecondary">
                    VIN: {vin}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box display="flex" justifyContent="flex-end">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="contained"
                        startIcon={<LocalPrintshopIcon />}
                        onClick={handlePrint}
                        sx={{
                          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                          color: 'white',
                          px: 3,
                          py: 1.5,
                          borderRadius: 2
                        }}
                      >
                        Print Report
                      </Button>
                    </motion.div>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </motion.div>

          {/* Financial Overview Section */}
          <Grid container spacing={4} sx={{ mt: 4 }}>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    height: '100%',
                    background: theme => `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <Typography variant="h6" gutterBottom sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 3
                  }}>
                    <MonetizationOnIcon /> Financial Overview
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        label="Purchase Price"
                        value={purchasePrice}
                        onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || 0)}
                        fullWidth
                        type="number"
                        InputProps={{
                          startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Total Maintenance Cost"
                        value={`$${totalMaintenanceCost.toFixed(2)}`}
                        fullWidth
                        InputProps={{ readOnly: true }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            backgroundColor: alpha('#000', 0.02)
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Sale Price"
                        value={salePrice}
                        onChange={(e) => setSalePrice(parseFloat(e.target.value) || 0)}
                        fullWidth
                        type="number"
                        InputProps={{
                          startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{
                        height: '2px',
                        background: 'linear-gradient(90deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.05) 100%)',
                        my: 2
                      }} />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Total Cost"
                        value={`$${(purchasePrice + totalMaintenanceCost).toFixed(2)}`}
                        fullWidth
                        InputProps={{ readOnly: true }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            backgroundColor: alpha('#000', 0.02)
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Gross Profit"
                        value={`$${(salePrice - (purchasePrice + totalMaintenanceCost)).toFixed(2)}`}
                        fullWidth
                        InputProps={{ readOnly: true }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            backgroundColor: alpha('#000', 0.02)
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </motion.div>
            </Grid>

            {/* Chart Section */}
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    height: '100%',
                    background: theme => `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <Typography variant="h6" gutterBottom sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 3
                  }}>
                    <TimelineIcon /> Cost Breakdown
                  </Typography>
                  <Box sx={{ 
                    height: 400, 
                    width: '100%',
                    position: 'relative',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      style={{ width: '100%', height: '100%' }}
                    >
                      <Pie data={pieData} options={pieOptions} />
                    </motion.div>
                    {totalMaintenanceCost > 0 && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          textAlign: 'center'
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            color: theme => theme.palette.text.secondary,
                            fontWeight: 'bold'
                          }}
                        >
                          Total
                        </Typography>
                        <Typography
                          variant="h5"
                          sx={{
                            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontWeight: 'bold'
                          }}
                        >
                          ${totalMaintenanceCost.toFixed(2)}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>

          {/* Maintenance Records Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Paper
              elevation={0}
              sx={{
                mt: 4,
                p: 3,
                borderRadius: 3,
                background: theme => `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <ReceiptLongIcon /> Maintenance Records
                </Typography>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddExpenseReport}
                    sx={{
                      background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                      color: 'white',
                      borderRadius: 2
                    }}
                  >
                    Add Record
                  </Button>
                </motion.div>
              </Box>

              <TableContainer>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      {['Date', 'Category', 'Vendor', 'Description', 'Cost', 'Actions'].map((header) => (
                        <TableCell 
                          key={header} 
                          sx={{ 
                            fontWeight: 'bold',
                            backgroundColor: theme => alpha(theme.palette.primary.main, 0.1),
                            borderBottom: '2px solid',
                            borderBottomColor: 'primary.main'
                          }}
                        >
                          {header}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <AnimatePresence>
                      {records.map((record, index) => (
                        <motion.tr
                          key={record._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          style={{ backgroundColor: index % 2 === 0 ? 'rgba(0,0,0,0.02)' : 'white' }}
                        >
                          <TableCell>{record.date_occurred}</TableCell>
                          <TableCell>{record.category}</TableCell>
                          <TableCell>{record.service_provider}</TableCell>
                          <TableCell>{record.notes}</TableCell>
                          <TableCell>${record.cost}</TableCell>
                          <TableCell>
                            <Box display="flex" gap={1}>
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                  variant="contained"
                                  size="small"
                                  onClick={() => handleEditRecord(record._id)}
                                  sx={{
                                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                    color: 'white'
                                  }}
                                >
                                  Edit
                                </Button>
                              </motion.div>
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                  variant="contained"
                                  size="small"
                                  onClick={() => handleDeleteRecord(record._id)}
                                  sx={{
                                    background: 'linear-gradient(45deg, #f44336 30%, #ff9800 90%)',
                                    color: 'white'
                                  }}
                                >
                                  Delete
                                </Button>
                              </motion.div>
                            </Box>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                    <TableRow>
                      <TableCell colSpan={4} sx={{ fontWeight: 'bold', textAlign: 'right' }}>
                        Total
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>${totalMaintenanceCost.toFixed(2)}</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </motion.div>
        </Box>

        <Modal open={manualEntryOpen} onClose={() => setManualEntryOpen(false)}>
            <Box
                sx={{
                    width: { xs: '90%', sm: '600px' },
                    margin: 'auto',
                    mt: 5,
                    p: 3,
                    bgcolor: 'white',
                    borderRadius: '10px',
                    boxShadow: 24,
                }}
            >
                <EnterDetailsManually
                    open={manualEntryOpen}
                    onClose={() => setManualEntryOpen(false)}
                    initialVin={vin}
                />
            </Box>
        </Modal>
      </Container>
    </motion.div>
  );
}

export default ViewDeal;
