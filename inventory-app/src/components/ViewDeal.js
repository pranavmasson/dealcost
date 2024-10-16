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
  Paper
} from '@mui/material';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register chart elements
ChartJS.register(ArcElement, Tooltip, Legend);
ChartJS.register(ChartDataLabels);

function ViewDeal() {
  const { vin } = useParams();  // Get the VIN from the URL parameter
  const navigate = useNavigate();  // Hook to navigate between routes
  const [records, setRecords] = useState([]);
  const [error, setError] = useState('');
  const [totalMaintenanceCost, setTotalMaintenanceCost] = useState(0);
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [salePrice, setSalePrice] = useState(0);
  const [yearMakeModel, setYearMakeModel] = useState({ year: '', make: '', model: '' });  // New state for year, make, model

  // Fetch car details (purchase price, sale price, year, make, model) based on VIN
  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/api/inventory/${vin}`);  // API to get car details by VIN
        const data = await response.json();

        if (response.ok) {
          setPurchasePrice(data.purchase_price || 0);
          setSalePrice(data.sale_price || 0);
          setYearMakeModel({ year: data.year, make: data.make, model: data.model });  // Set year, make, model
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

  // Navigate to the edit report page
  const handleEditRecord = (recordId) => {
    navigate(`/edit-report/${recordId}`);  // Redirect to edit-report route with the report ID
  };

  // Navigate to the add expense report page for the current VIN
  const handleAddExpenseReport = () => {
    navigate(`/add-expense-report/${vin}`);  // Redirect to the add expense report page
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
          label: function (tooltipItem) {
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

  // Clean print function with simplified content
  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>Maintenance Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { font-size: 24px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { padding: 8px; border: 1px solid #ccc; text-align: left; }
            th { background-color: #f0f0f0; }
          </style>
        </head>
        <body>
          <h1>Maintenance Report for VIN: ${vin}</h1>
          <h2>${yearMakeModel.year} ${yearMakeModel.make} ${yearMakeModel.model}</h2>
          
          <h2>Cost Summary</h2>
          <p><strong>Purchase Price:</strong> $${purchasePrice.toFixed(2)}</p>
          <p><strong>Total Maintenance Cost:</strong> $${totalMaintenanceCost.toFixed(2)}</p>
          <p><strong>Total Cost (Purchase + Maintenance):</strong> $${(purchasePrice + totalMaintenanceCost).toFixed(2)}</p>
          <p><strong>Sale Price:</strong> $${salePrice.toFixed(2)}</p>
          <p><strong>Difference (Sale Price - Total Cost):</strong> $${(salePrice - (purchasePrice + totalMaintenanceCost)).toFixed(2)}</p>
          
          <h2>Maintenance Records</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Cost</th>
                <th>Category</th>
                <th>Vendor</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              ${records.map(record => `
                <tr>
                  <td>${record.date_occurred}</td>
                  <td>$${record.cost}</td>
                  <td>${record.category}</td>
                  <td>${record.vendor}</td>
                  <td>${record.description || 'No description'}</td>
                </tr>
              `).join('')}
              <tr>
                <td><strong>Total</strong></td>
                <td><strong>$${totalMaintenanceCost.toFixed(2)}</strong></td>
                <td colspan="3"></td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <Container maxWidth="lg">
      <Box mt={5}>
        <Typography variant="h4" gutterBottom>
          VIN: {vin}
        </Typography>
        <Typography variant="h6" gutterBottom>
          {`${yearMakeModel.year} ${yearMakeModel.make.toUpperCase()} ${yearMakeModel.model.toUpperCase()}`}
        </Typography>


        {/* Print and Add Expense Report Buttons (aligned to the right) */}
        <Box display="flex" justifyContent="flex-end" gap={2}>
          <Button variant="contained" color="primary" onClick={handlePrint}>
            Print Report
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/enter-details-manually", { state: { vin } })}  // Pass VIN as state
          >
            Add Expense Report
          </Button>
        </Box>

        {/* Rest of your component */}
        <Box display="flex" flexDirection="column" alignItems="left">
          <Typography variant="h5" gutterBottom style={{ textAlign: 'left' }}>
            Maintenance Costs by Category
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} style={{ height: '300px', width: '300px' }}>
              <Pie data={pieData} options={pieOptions} />
            </Grid>

            <Grid item xs={12} sm={6}>
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

        {/* Table for maintenance records */}
        <TableContainer component={Paper} sx={{ marginTop: 4 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {['Date', 'Cost', 'Category', 'Vendor', 'Description', 'Receipt', 'Actions'].map((header) => (
                  <TableCell key={header} sx={{ fontWeight: 'bold', borderRight: '1px solid #d0d0d0' }}>
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record._id} hover sx={{ backgroundColor: 'white' }}>
                  <TableCell sx={{ borderRight: '1px solid #d0d0d0' }}>{record.date_occurred}</TableCell>
                  <TableCell sx={{ borderRight: '1px solid #d0d0d0' }}>${record.cost}</TableCell>
                  <TableCell sx={{ borderRight: '1px solid #d0d0d0' }}>{record.category}</TableCell>
                  <TableCell sx={{ borderRight: '1px solid #d0d0d0' }}>{record.vendor}</TableCell>
                  <TableCell sx={{ borderRight: '1px solid #d0d0d0' }}>{record.description || 'No description'}</TableCell>
                  <TableCell sx={{ borderRight: '1px solid #d0d0d0' }}> {/* Placeholder for receipt */}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => handleEditRecord(record._id)}  // Edit button to navigate to edit page
                    >
                      Edit
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      size="small"
                      onClick={() => handleDeleteRecord(record._id)}
                      sx={{ ml: 1 }}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {/* Add a footer row for total maintenance cost */}
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>${totalMaintenanceCost.toFixed(2)}</TableCell>
                <TableCell colSpan={5}></TableCell> {/* Empty cells for alignment */}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
}

export default ViewDeal;