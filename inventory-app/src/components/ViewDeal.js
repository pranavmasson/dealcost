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
} from '@mui/material';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

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
  

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/api/inventory/${vin}`);
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

  const calculateTotalMaintenance = (records) => {
    const total = records.reduce((sum, record) => sum + parseFloat(record.cost), 0);
    setTotalMaintenanceCost(total);
  };

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
    navigate(`/add-expense-report/${vin}`);
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
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#66BB6A', '#EF5350', '#AB47BC'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#66BB6A', '#EF5350', '#AB47BC'],
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const total = maintenanceCostsByCategory.reduce((sum, value) => sum + value, 0);
            const value = tooltipItem.raw;
            const percent = ((value / total) * 100).toFixed(2);
            return `${tooltipItem.label}: $${value} (${percent}%)`;
          },
        },
      },
      datalabels: {
        color: '#fff',
        formatter: (value) => `$${value}`,
        anchor: 'end',
        align: 'start',
        offset: -10,
        borderWidth: 2,
        borderColor: '#fff',
        borderRadius: 25,
        backgroundColor: (context) => context.dataset.backgroundColor,
        padding: 6,
      },
      legend: {
        position: 'top',
      },
    },
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

        <Box display="flex" justifyContent="flex-end" gap={2}>
        <Button variant="contained" color="primary" onClick={handlePrint}>
    Print Report
  </Button>
        </Box>

        <Box display="flex" flexDirection="column" alignItems="left">

          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} style={{ height: '400px', width: '400px' }}>
              <Pie data={pieData} options={pieOptions} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="h5" gutterBottom>
                DealCost
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Total Maintenance Cost"
                    value={`$${totalMaintenanceCost.toFixed(2)}`}
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

                {/* Horizontal Black Bar */}
                <Grid item xs={12}>
                  <Box
                    sx={{
                      width: '100%',
                      height: '2px',
                      backgroundColor: 'black',
                      marginY: 2, // Adds spacing above and below the bar
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Total Cost"
                    value={`$${(purchasePrice + totalMaintenanceCost).toFixed(2)}`}
                    fullWidth
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Gross Profit"
                    value={`$${(salePrice - (purchasePrice + totalMaintenanceCost)).toFixed(2)}`}
                    fullWidth
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>

        {error && <Typography color="error">{error}</Typography>}

        <Typography variant="h5" gutterBottom sx={{ textAlign: 'left', mt: 4 }}>
  Reconditioning Cost Records
</Typography>


        <TableContainer component={Paper} sx={{ marginTop: 4 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {['Date', 'Category', 'Vendor', 'Description', 'Receipt', 'Cost', 'Actions'].map((header) => (
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
                  <TableCell sx={{ borderRight: '1px solid #d0d0d0' }}>{record.category}</TableCell>
                  <TableCell sx={{ borderRight: '1px solid #d0d0d0' }}>{record.service_provider}</TableCell>
                  <TableCell sx={{ borderRight: '1px solid #d0d0d0' }}>{record.notes}</TableCell>
                  <TableCell sx={{ borderRight: '1px solid #d0d0d0' }}></TableCell>
                  <TableCell sx={{ borderRight: '1px solid #d0d0d0' }}>${record.cost}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => handleEditRecord(record._id)}
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
              <TableRow>
                <TableCell colSpan={5} sx={{ fontWeight: 'bold', textAlign: 'right' }}>
                  Total
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>${totalMaintenanceCost.toFixed(2)}</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
}

export default ViewDeal;
