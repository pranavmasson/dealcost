import React, { useState, useEffect, useRef } from 'react';
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
  IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { motion } from 'framer-motion'; // Import framer-motion for animations
import Modal from '@mui/material/Modal';
import EditCar from './EditCar';
import EnterDetailsManually from './EnterDetailsManually';
import Tooltip from '@mui/material/Tooltip';

function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [error, setError] = useState('');
  const [showSold, setShowSold] = useState(false);
  const [sortKey, setSortKey] = useState('vin');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filter, setFilter] = useState({ make: '', model: '', minPrice: '', maxPrice: '' });
  const [keyword, setKeyword] = useState('');
  const [reconditioningCosts, setReconditioningCosts] = useState({});
  const tableContainerRef = useRef(null);

  const [filterSold, setFilterSold] = useState('available'); // Default to "all"
  const [filterMonth, setFilterMonth] = useState(''); // Default to no specific month
  const [filterYear, setFilterYear] = useState(''); // Default to no specific year


  const [open, setOpen] = useState(false); // Manage modal visibility
  const [selectedVin, setSelectedVin] = useState(null); // Track selected VIN

  const [manualEntryOpen, setManualEntryOpen] = useState(false);
  const [manualEntryVin, setManualEntryVin] = useState(null);

  const handleOpenManualEntry = (vin) => {
    setManualEntryVin(vin);
    setManualEntryOpen(true);
  };

  const handleCloseManualEntry = () => {
    setManualEntryOpen(false);
    setManualEntryVin(null);
  };

  const navigate = useNavigate();

  const modalAnimation = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.3 } },
  };

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const username = localStorage.getItem('username');
        const response = await fetch(`http://127.0.0.1:5000/api/inventory?username=${username}`);
        const data = await response.json();

        if (response.ok) {
          setInventory(data.inventory);
          calculateReconditioningCosts(data.inventory, username);
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

  const calculateReconditioningCosts = async (inventory, username) => {
    const costs = {};
    for (const item of inventory) {
      const response = await fetch(`http://127.0.0.1:5000/api/reports?vin=${item.vin}&username=${username}`);
      const data = await response.json();
      if (response.ok) {
        const totalCost = data.records.reduce((sum, record) => sum + parseFloat(record.cost || 0), 0);
        costs[item.vin] = totalCost;
      }
    }
    setReconditioningCosts(costs);
  };

  const handleOpen = (vin) => {
    setSelectedVin(vin);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedVin(null);
  };

  const handleViewDeal = (vin) => navigate(`/view-deal/${vin}`);
  const handleAddExpenseReport = (vin) => navigate(`/enter-details-manually`, { state: { vin } });

  const handleDeleteCar = async (vin) => {
    try {
      const username = localStorage.getItem('username');
      const response = await fetch(`http://127.0.0.1:5000/api/delete_vehicle`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vin, username }),
      });
      const data = await response.json();

      if (response.ok) {
        setInventory(inventory.filter((item) => item.vin !== vin));
        alert(data.message);
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Error deleting car:', error);
      alert('An error occurred while deleting the car');
    }
  };

  const formatPrice = (price) => `$${(parseFloat(price) || 0).toFixed(2)}`;

  const sortInventory = (a, b) => {
    if (sortKey === 'purchase_date') {
      const dateA = new Date(a.purchase_date || '');
      const dateB = new Date(b.purchase_date || '');
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    } else {
      return sortOrder === 'asc'
        ? a[sortKey] > b[sortKey] ? 1 : -1
        : a[sortKey] < b[sortKey] ? 1 : -1;
    }
  };

  const filteredSortedInventory = inventory
    .filter((item) => {
      if (filterSold === 'sold' && item.sale_status !== 'sold') return false;
      if (filterSold === 'available' && item.sale_status !== 'available') return false;

      if (filterMonth || filterYear) {
        const [month, , year] = item.date_sold ? item.date_sold.split('/') : [];
        if (filterMonth && parseInt(month) !== parseInt(filterMonth)) return false;
        if (filterYear && parseInt(year) !== parseInt(filterYear)) return false;
      }

      return true;
    })
    .filter((item) => {
      const { make, model, minPrice, maxPrice } = filter;
      const matchesMake = make ? item.make.toLowerCase().includes(make.toLowerCase()) : true;
      const matchesModel = model ? item.model.toLowerCase().includes(model.toLowerCase()) : true;
      const matchesMinPrice = minPrice ? item.sale_price >= parseFloat(minPrice) : true;
      const matchesMaxPrice = maxPrice ? item.sale_price <= parseFloat(maxPrice) : true;
      const matchesKeyword = keyword
        ? Object.values(item).some((value) =>
          value ? value.toString().toLowerCase().includes(keyword.toLowerCase()) : false
        )
        : true;
      return matchesMake && matchesModel && matchesMinPrice && matchesMaxPrice && matchesKeyword;
    })
    .sort(sortInventory);

  const scrollHorizontally = (direction) => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollLeft += direction === 'left' ? -100 : 100;
    }
  };

  const scrollVertically = (direction) => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTop += direction === 'up' ? -100 : 100;
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Container maxWidth="lg">
        <Box mt={5}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            textAlign="left"
            fontWeight="bold"
            sx={{ textTransform: 'uppercase', letterSpacing: 2 }}
          >
            Your Inventory
          </Typography>

          <Box display="flex" gap={2} mb={3} alignItems="center">
            <Select
              value={filterSold}
              onChange={(e) => setFilterSold(e.target.value)}
              displayEmpty
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="available">Show Available</MenuItem>
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="sold">Show Sold</MenuItem>
            </Select>

            <Select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              displayEmpty
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="">All Months</MenuItem>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <MenuItem key={month} value={month}>
                  {new Date(0, month - 1).toLocaleString('default', { month: 'long' })}
                </MenuItem>
              ))}
            </Select>

            <Select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              displayEmpty
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="">All Years</MenuItem>
              {[2030, 2029, 2028, 2027, 2026, 2025, 2024, 2023, 2022, 2021].reverse().map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </Box>





          <Box display="flex" gap={2} mb={3}>
            <TextField label="Filter by Make" value={filter.make} onChange={(e) => setFilter({ ...filter, make: e.target.value })} />
            <TextField label="Filter by Model" value={filter.model} onChange={(e) => setFilter({ ...filter, model: e.target.value })} />
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
            <TextField label="Search Keyword" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
          </Box>

          <Box display="flex" gap={2} mb={3}>
            <Select value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
              <MenuItem value="vin">VIN</MenuItem>
              <MenuItem value="make">Make</MenuItem>
              <MenuItem value="model">Model</MenuItem>
              <MenuItem value="purchase_price">Purchase Price</MenuItem>
              <MenuItem value="sale_price">Sale Price</MenuItem>
              <MenuItem value="purchase_date">Purchase Date</MenuItem>
            </Select>
            <Button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} variant="outlined">
              {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            </Button>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={2}>
            <Box>
              <IconButton onClick={() => scrollHorizontally('left')}>
                <ArrowBackIosIcon />
              </IconButton>
              <IconButton onClick={() => scrollHorizontally('right')}>
                <ArrowForwardIosIcon />
              </IconButton>
            </Box>
            <Box>
              <IconButton onClick={() => scrollVertically('up')}>
                <ArrowUpwardIcon />
              </IconButton>
              <IconButton onClick={() => scrollVertically('down')}>
                <ArrowDownwardIcon />
              </IconButton>
            </Box>
          </Box>

          <TableContainer component={Paper} ref={tableContainerRef}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#b3e5fc' }}>
                  {[
                    'Purchase Date',
                    'Year',
                    'Make',
                    'Model',
                    'Trim',
                    'Mileage',
                    'Color',
                    'VIN',
                    'Purchase Price',
                    'Title Received?',
                    'Reconditioning Cost',
                    'Total Cost',
                    'Date Sold',
                    'Sale Price',
                    'Gross Profit',
                    'Vehicle Status',
                    'Pending Issues',
                    'Closing Statement',
                    'Actions',
                  ].map((header) => (
                    <TableCell
                      key={header}
                      sx={{
                        fontWeight: 'bold',
                        textAlign: header === 'Actions' ? 'center' : 'left', // Center "Actions" only
                      }}
                    >
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSortedInventory.map((item, index) => {
                  const reconditionCost = reconditioningCosts[item.vin] || 0;
                  const totalCost = item.purchase_price + reconditionCost;
                  const profit = item.sale_status === 'sold' ? item.sale_price - totalCost : 'N/A';

                  return (
                    <TableRow key={item._id} hover sx={{ backgroundColor: index % 2 === 0 ? '#f5f5f5' : 'white' }}>
                      <TableCell>{item.purchase_date}</TableCell>
                      <TableCell>{item.year}</TableCell>
                      <TableCell>{item.make || 'N/A'}</TableCell>
                      <TableCell>{item.model || 'N/A'}</TableCell>
                      <TableCell>{item.trim || 'N/A'}</TableCell>
                      <TableCell>{item.mileage || 'N/A'}</TableCell>
                      <TableCell>{item.color || 'N/A'}</TableCell>
                      <TableCell>{item.vin}</TableCell>
                      <TableCell>{formatPrice(item.purchase_price)}</TableCell>
                      <TableCell>{item.title_received || 'N/A'}</TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          color="primary"
                          sx={{ cursor: 'pointer', textDecoration: 'underline' }}
                          onClick={() => handleViewDeal(item.vin)}
                        >
                          {formatPrice(reconditionCost)}
                        </Typography>
                      </TableCell>
                      <TableCell>{formatPrice(totalCost)}</TableCell>
                      <TableCell>{item.date_sold || 'N/A'}</TableCell>
                      <TableCell>{formatPrice(item.sale_price || 0)}</TableCell>
                      <TableCell>{item.sale_status === 'sold' ? formatPrice(profit) : profit}</TableCell>
                      <TableCell>{item.sale_status}</TableCell>
                      <TableCell>
          <Typography
            variant="body2"
            sx={{
              color: 'red', // Red text for pending issues
            }}
          >
            {item.pending_issues} {/* Replace 'None' with a default if no data */}
          </Typography>
        </TableCell>
                      <TableCell>
                        <Tooltip title={item.closing_statement || 'N/A'} arrow>
                          <Typography
                            variant="body2"
                            sx={{
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxWidth: 200, // Adjust as needed
                            }}
                          >
                            {item.closing_statement || 'N/A'}
                          </Typography>
                        </Tooltip>
                      </TableCell>

                      <TableCell
                        sx={{
                          textAlign: 'center', // Center the buttons in the actions column
                        }}
                      >
                        <Box display="flex" gap={1} justifyContent="center"> {/* Center the buttons */}
                          <Button variant="outlined" onClick={() => handleViewDeal(item.vin)} size="small">
                            DealCost
                          </Button>
                          <Button variant="outlined" onClick={() => handleOpen(item.vin)} size="small">
                            Edit
                          </Button>
                          <Button
                            variant="outlined"
                            onClick={() => handleOpenManualEntry(item.vin)}
                            size="small"
                            sx={{ color: '#1976d2' }}
                          >
                            Add Expense
                          </Button>
                          <Button
                            variant="outlined"
                            onClick={() => handleDeleteCar(item.vin)}
                            size="small"
                            sx={{ color: '#d32f2f' }}
                          >
                            Delete
                          </Button>
                        </Box>
                      </TableCell>

                    </TableRow>
                  );
                })}
                {/* Add totals row */}
                <TableRow sx={{ backgroundColor: '#e0f7fa', fontWeight: 'bold' }}>
                  <TableCell colSpan={8} sx={{ textAlign: 'right', fontWeight: 'bold' }}>
                    Totals:
                  </TableCell>
                  <TableCell>{formatPrice(filteredSortedInventory.reduce((sum, item) => sum + item.purchase_price, 0))}</TableCell>
                  <TableCell></TableCell>
                  <TableCell>{formatPrice(filteredSortedInventory.reduce((sum, item) => sum + (reconditioningCosts[item.vin] || 0), 0))}</TableCell>
                  <TableCell>{formatPrice(filteredSortedInventory.reduce((sum, item) => sum + (item.purchase_price + (reconditioningCosts[item.vin] || 0)), 0))}</TableCell>
                  <TableCell></TableCell>
                  <TableCell>{formatPrice(filteredSortedInventory.reduce((sum, item) => sum + (item.sale_price || 0), 0))}</TableCell>
                  <TableCell>{formatPrice(filteredSortedInventory.reduce((sum, item) => sum + (item.sale_status === 'sold' ? item.sale_price - (item.purchase_price + (reconditioningCosts[item.vin] || 0)) : 0), 0))}</TableCell>
                  <TableCell colSpan={3}></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Modal open={open} onClose={handleClose}>
            <Box
              sx={{
                width: '600px',
                margin: 'auto',
                mt: 5,
                p: 3,
                bgcolor: 'white',
                borderRadius: '10px',
                boxShadow: 24,
              }}
            >
              {selectedVin && <EditCar vin={selectedVin} open={open} onClose={handleClose} />}
            </Box>
          </Modal>
          <Modal open={manualEntryOpen} onClose={handleCloseManualEntry}>
            <Box
              sx={{
                width: '600px',
                margin: 'auto',
                mt: 5,
                p: 3,
                bgcolor: 'white',
                borderRadius: '10px',
                boxShadow: 24,
              }}
            >
              {manualEntryVin && (
                <EnterDetailsManually
                  open={manualEntryOpen}
                  onClose={handleCloseManualEntry}
                  initialVin={manualEntryVin}
                />
              )}
            </Box>
          </Modal>

        </Box>
      </Container>
    </motion.div>
  );
}

export default Inventory;