import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Switch,
  FormControlLabel,
  TextField,
  Select,
  MenuItem,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [error, setError] = useState('');
  const [showSold, setShowSold] = useState(false); // To toggle between sold and available inventory
  const [sortKey, setSortKey] = useState('vin'); // Default sort by VIN
  const [sortOrder, setSortOrder] = useState('asc'); // Ascending by default
  const [filter, setFilter] = useState({ make: '', model: '', minPrice: '', maxPrice: '' });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const username = localStorage.getItem('username'); // Retrieve the logged-in username from local storage
        const response = await fetch(`http://127.0.0.1:5000/api/inventory?username=${username}`);
        const data = await response.json();

        if (response.ok) {
          setInventory(data.inventory);
        } else {
          setError(data.error);
        }
      } catch (error) {
        console.error('Error fetching inventory:', error);
        setError('An error occurred while fetching inventory');
      }
    };

    fetchInventory();
  }, []);

  const handleViewDeal = (vin) => {
    navigate(`/view-deal/${vin}`); // Navigate to the ViewDeal page with the car's VIN
  };

  const handleEditCar = (vin) => {
    navigate(`/edit-car/${vin}`); // Navigate to EditCar page with the car's VIN
  };

  const handleAddExpenseReport = (vin) => {
    navigate(`/enter-details-manually`, { state: { vin } }); // Navigate to EnterDetailsManually with VIN passed as state
  };

  const handleDeleteCar = async (vin) => {
    try {
      const username = localStorage.getItem('username'); // Retrieve the logged-in username from local storage

      const response = await fetch(`http://127.0.0.1:5000/api/delete_vehicle`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vin, username }),
      });

      const data = await response.json();

      if (response.ok) {
        setInventory(inventory.filter((item) => item.vin !== vin)); // Remove the deleted car from the state
        alert(data.message);
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Error deleting car:', error);
      alert('An error occurred while deleting the car');
    }
  };

  // Utility function to format price as $00000.00
  const formatPrice = (price) => {
    const numericPrice = parseFloat(price) || 0; // Convert to number or default to 0 if invalid
    return `$${numericPrice.toFixed(2)}`;
  };

  // Sort Function
  const sortInventory = (a, b) => {
    if (sortOrder === 'asc') {
      return a[sortKey] > b[sortKey] ? 1 : -1;
    }
    return a[sortKey] < b[sortKey] ? 1 : -1;
  };

  // Filter Function
  const filterInventory = (item) => {
    const { make, model, minPrice, maxPrice } = filter;
    const matchesMake = make ? item.make.toLowerCase().includes(make.toLowerCase()) : true;
    const matchesModel = model ? item.model.toLowerCase().includes(model.toLowerCase()) : true;
    const matchesMinPrice = minPrice ? item.sale_price >= parseFloat(minPrice) : true;
    const matchesMaxPrice = maxPrice ? item.sale_price <= parseFloat(maxPrice) : true;
    return matchesMake && matchesModel && matchesMinPrice && matchesMaxPrice;
  };

  // Toggle based on sold status
  const filteredSortedInventory = inventory
    .filter(item => (showSold ? item.sale_status === 'sold' : item.sale_status !== 'sold'))
    .filter(filterInventory)
    .sort(sortInventory);

  // Calculate additional fields
  const calculateTotalCost = (purchasePrice, reconditionCost) => {
    return (purchasePrice + reconditionCost).toFixed(2);
  };

  const calculateProfit = (salePrice, totalCost) => {
    return (salePrice - totalCost).toFixed(2);
  };

  return (
    <Container maxWidth="lg">
      <Box mt={5}>
        <Typography variant="h4" gutterBottom>
          Your Inventory
        </Typography>

        {/* Toggle between available and sold inventory */}
        <FormControlLabel
          control={<Switch checked={showSold} onChange={() => setShowSold(!showSold)} />}
          label={showSold ? 'Show Available' : 'Show Sold'}
          sx={{ mb: 2 }}
        />

        {/* Filter Inputs */}
        <Box display="flex" gap={2} mb={3}>
          <TextField
            label="Filter by Make"
            value={filter.make}
            onChange={(e) => setFilter({ ...filter, make: e.target.value })}
          />
          <TextField
            label="Filter by Model"
            value={filter.model}
            onChange={(e) => setFilter({ ...filter, model: e.target.value })}
          />
          <TextField
            label="Min Sale Price"
            type="number"
            value={filter.minPrice}
            onChange={(e) => setFilter({ ...filter, minPrice: e.target.value })}
          />
          <TextField
            label="Max Sale Price"
            type="number"
            value={filter.maxPrice}
            onChange={(e) => setFilter({ ...filter, maxPrice: e.target.value })}
          />
        </Box>

        {/* Sort Controls */}
        <Box display="flex" gap={2} mb={3}>
          <Select
            label="Sort By"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
          >
            <MenuItem value="vin">VIN</MenuItem>
            <MenuItem value="make">Make</MenuItem>
            <MenuItem value="model">Model</MenuItem>
            <MenuItem value="purchase_price">Purchase Price</MenuItem>
            <MenuItem value="sale_price">Sale Price</MenuItem>
          </Select>
          <Button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            variant="outlined"
          >
            {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          </Button>
        </Box>

        {error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  {[
                    'VIN', 'Make', 'Model', 'Trim', 'Mileage', 'Color', 'Purchase Price', 'Recondition Cost',
                    'Total Cost', 'Sale Price', 'Profit', 'Purchase Date', 'Date Sold', 'Sale Status', 'Actions'
                  ].map((header) => (
                    <TableCell
                      key={header}
                      sx={{
                        borderRight: '1px solid #d0d0d0', // Add vertical line to each header cell
                        fontWeight: 'bold',
                      }}
                    >
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSortedInventory.map((item) => {
                  const totalCost = calculateTotalCost(item.purchase_price, item.recondition_cost || 0);
                  const profit = item.sale_status === 'sold' ? calculateProfit(item.sale_price, totalCost) : 'N/A';

                  return (
                    <TableRow key={item._id} hover sx={{ backgroundColor: item.sale_status === 'sold' ? '#f0f0f0' : 'white' }}>
                      <TableCell sx={{ borderRight: '1px solid #d0d0d0' }}>{item.vin}</TableCell>
                      <TableCell sx={{ borderRight: '1px solid #d0d0d0' }}>{item.make || 'N/A'}</TableCell>
                      <TableCell sx={{ borderRight: '1px solid #d0d0d0' }}>{item.model || 'N/A'}</TableCell>
                      <TableCell sx={{ borderRight: '1px solid #d0d0d0' }}>{item.trim || 'N/A'}</TableCell>
                      <TableCell sx={{ borderRight: '1px solid #d0d0d0' }}>{item.mileage || 'N/A'}</TableCell>
                      <TableCell sx={{ borderRight: '1px solid #d0d0d0' }}>{item.color || 'N/A'}</TableCell>
                      <TableCell sx={{ borderRight: '1px solid #d0d0d0' }}>{formatPrice(item.purchase_price)}</TableCell>
                      <TableCell sx={{ borderRight: '1px solid #d0d0d0' }}>{formatPrice(item.recondition_cost || 0)}</TableCell>
                      <TableCell sx={{ borderRight: '1px solid #d0d0d0' }}>{formatPrice(totalCost)}</TableCell>

                      {/* Sale Price as a hyperlink */}
                      <TableCell sx={{ borderRight: '1px solid #d0d0d0' }}>
                        <Button
                          variant="text"
                          color="primary"
                          onClick={() => handleViewDeal(item.vin)}
                          sx={{
                            textDecoration: 'underline', // Style to make it look like a hyperlink
                            cursor: 'pointer',
                          }}
                        >
                          {formatPrice(item.sale_price || 0)}
                        </Button>
                      </TableCell>

                      <TableCell sx={{ borderRight: '1px solid #d0d0d0' }}>{profit}</TableCell>
                      <TableCell sx={{ borderRight: '1px solid #d0d0d0' }}>{item.purchase_date || 'N/A'}</TableCell>
                      <TableCell sx={{ borderRight: '1px solid #d0d0d0' }}>{item.date_sold || 'N/A'}</TableCell>
                      <TableCell sx={{ borderRight: '1px solid #d0d0d0' }}>{item.sale_status}</TableCell>
                      <TableCell>
                        <Box display="flex" flexDirection="column" gap={1}>
                          <Button
                            variant="contained"
                            onClick={() => handleViewDeal(item.vin)}
                            size="small"
                            sx={{
                              backgroundColor: '#1976d2', // Blue for view
                              color: 'white',
                              borderRadius: 2,
                              fontSize: '12px',
                              padding: '6px 8px',
                              '&:hover': {
                                backgroundColor: '#1565c0',
                              },
                            }}
                          >
                            View Deal
                          </Button>
                          <Button
                            variant="contained"
                            onClick={() => handleEditCar(item.vin)}
                            size="small"
                            sx={{
                              backgroundColor: '#1976d2', // Blue for edit
                              color: 'white',
                              borderRadius: 2,
                              fontSize: '12px',
                              padding: '6px 8px',
                              '&:hover': {
                                backgroundColor: '#1565c0',
                              },
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="contained"
                            onClick={() => handleAddExpenseReport(item.vin)}
                            size="small"
                            sx={{
                              backgroundColor: '#43a047', // Green for add report
                              color: 'white',
                              borderRadius: 2,
                              fontSize: '12px',
                              padding: '6px 8px',
                              '&:hover': {
                                backgroundColor: '#388e3c',
                              },
                            }}
                          >
                            Add Report
                          </Button>
                          <Button
                            variant="contained"
                            onClick={() => handleDeleteCar(item.vin)}
                            size="small"
                            sx={{
                              backgroundColor: '#d32f2f', // Red for delete
                              color: 'white',
                              borderRadius: 2,
                              fontSize: '12px',
                              padding: '6px 8px',
                              '&:hover': {
                                backgroundColor: '#c62828',
                              },
                            }}
                          >
                            Delete
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Container>
  );
}

export default Inventory;