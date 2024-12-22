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
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

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

  const [showAddSuccess, setShowAddSuccess] = useState(false);

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
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/inventory?username=${username}`);
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

  useEffect(() => {
    const wasCarAdded = localStorage.getItem('showAddSuccess');
    if (wasCarAdded) {
      setShowAddSuccess(true);
      localStorage.removeItem('showAddSuccess');
      setTimeout(() => setShowAddSuccess(false), 3000);
    }
  }, []);

  const calculateReconditioningCosts = async (inventory, username) => {
    const costs = {};
    for (const item of inventory) {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/reports?vin=${item.vin}&username=${username}`);
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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/delete_vehicle`, {
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

  const exportToExcel = () => {
    const companyName = localStorage.getItem('company_name');
    const companyAddress = localStorage.getItem('address');
    const currentDate = format(new Date(), 'MM/dd/yyyy');

    const header = [
      ['Company Name:', companyName || ''],
      ['Address:', companyAddress || ''],
      ['Run Date:', currentDate],
      [''],
      [
        'Purchase Date', 'Year', 'Make', 'Model', 'Trim', 'Mileage', 'Color', 'VIN',
        'Purchase Price', 'Title Received?', 'Inspection Completed?', 'Reconditioning Cost',
        'Total Cost', 'Date Sold', 'Sale Price', 'Gross Profit', 'Vehicle Status',
        'Pending Issues', 'Closing Statement'
      ]
    ];

    const data = filteredSortedInventory.map(item => {
      const reconditionCost = reconditioningCosts[item.vin] || 0;
      const totalCost = item.purchase_price + reconditionCost;
      const profit = item.sale_status === 'sold' ? item.sale_price - totalCost : 'N/A';

      return [
        item.purchase_date,
        item.year,
        item.make,
        item.model,
        item.trim,
        item.mileage,
        item.color,
        item.vin,
        item.purchase_price,
        item.title_received,
        item.inspection_received,
        reconditionCost,
        totalCost,
        item.date_sold || 'N/A',
        item.sale_price || 0,
        profit,
        item.sale_status,
        item.pending_issues,
        item.closing_statement
      ];
    });

    const totalsRow = [
      'TOTALS',
      '', '', '', '', '', '', '',
      filteredSortedInventory.reduce((sum, item) => sum + item.purchase_price, 0),
      '', '',
      filteredSortedInventory.reduce((sum, item) => sum + (reconditioningCosts[item.vin] || 0), 0),
      filteredSortedInventory.reduce((sum, item) => sum + (item.purchase_price + (reconditioningCosts[item.vin] || 0)), 0),
      '',
      filteredSortedInventory.reduce((sum, item) => sum + (item.sale_price || 0), 0),
      filteredSortedInventory.reduce((sum, item) => sum + (item.sale_status === 'sold' ? item.sale_price - (item.purchase_price + (reconditioningCosts[item.vin] || 0)) : 0), 0)
    ];

    const ws = XLSX.utils.aoa_to_sheet([...header, ...data, totalsRow]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
    XLSX.writeFile(wb, `Inventory_${currentDate}.xlsx`);
  };

  const exportToCSV = () => {
    const companyName = localStorage.getItem('company_name');
    const companyAddress = localStorage.getItem('address');
    const currentDate = format(new Date(), 'MM/dd/yyyy');

    let csvContent = `Company Name,${companyName || ''}\n`;
    csvContent += `Address,${companyAddress || ''}\n`;
    csvContent += `Run Date,${currentDate}\n\n`;

    // Add headers
    csvContent += 'Purchase Date,Year,Make,Model,Trim,Mileage,Color,VIN,Purchase Price,Title Received?,Inspection Completed?,Reconditioning Cost,Total Cost,Date Sold,Sale Price,Gross Profit,Vehicle Status,Pending Issues,Closing Statement\n';

    // Add data rows
    filteredSortedInventory.forEach(item => {
      const reconditionCost = reconditioningCosts[item.vin] || 0;
      const totalCost = item.purchase_price + reconditionCost;
      const profit = item.sale_status === 'sold' ? item.sale_price - totalCost : 'N/A';

      csvContent += `${[
        item.purchase_date,
        item.year,
        item.make,
        item.model,
        item.trim,
        item.mileage,
        item.color,
        item.vin,
        item.purchase_price,
        item.title_received,
        item.inspection_received,
        reconditionCost,
        totalCost,
        item.date_sold || 'N/A',
        item.sale_price || 0,
        profit,
        item.sale_status,
        item.pending_issues,
        item.closing_statement
      ].join(',')}\n`;
    });

    // Add totals row
    csvContent += `TOTALS,,,,,,,,${[
      filteredSortedInventory.reduce((sum, item) => sum + item.purchase_price, 0),
      '','',
      filteredSortedInventory.reduce((sum, item) => sum + (reconditioningCosts[item.vin] || 0), 0),
      filteredSortedInventory.reduce((sum, item) => sum + (item.purchase_price + (reconditioningCosts[item.vin] || 0)), 0),
      '',
      filteredSortedInventory.reduce((sum, item) => sum + (item.sale_price || 0), 0),
      filteredSortedInventory.reduce((sum, item) => sum + (item.sale_status === 'sold' ? item.sale_price - (item.purchase_price + (reconditioningCosts[item.vin] || 0)) : 0), 0)
    ].join(',')}\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Inventory_${currentDate}.csv`;
    link.click();
  };

  const printToPDF = () => {
    const doc = new jsPDF('l', 'pt', 'a4');
    const companyName = localStorage.getItem('company_name');
    const companyAddress = localStorage.getItem('address');
    const currentDate = format(new Date(), 'MM/dd/yyyy');

    // Add header
    doc.setFontSize(18);
    doc.text(companyName || 'Inventory Report', 40, 40);
    doc.setFontSize(12);
    doc.text(`Address: ${companyAddress || ''}`, 40, 60);
    doc.text(`Run Date: ${currentDate}`, 40, 80);

    const tableData = filteredSortedInventory.map(item => {
      const reconditionCost = reconditioningCosts[item.vin] || 0;
      const totalCost = item.purchase_price + reconditionCost;
      const profit = item.sale_status === 'sold' ? item.sale_price - totalCost : 'N/A';

      return [
        item.purchase_date,
        item.year,
        item.make,
        item.model,
        item.trim,
        item.mileage,
        item.color,
        item.vin,
        formatPrice(item.purchase_price),
        item.title_received,
        item.inspection_received,
        formatPrice(reconditionCost),
        formatPrice(totalCost),
        item.date_sold || 'N/A',
        formatPrice(item.sale_price || 0),
        formatPrice(profit),
        item.sale_status,
        item.pending_issues,
        item.closing_statement
      ];
    });

    // Add totals row
    const totalsRow = [
      'TOTALS', '', '', '', '', '', '', '',
      formatPrice(filteredSortedInventory.reduce((sum, item) => sum + item.purchase_price, 0)),
      '', '',
      formatPrice(filteredSortedInventory.reduce((sum, item) => sum + (reconditioningCosts[item.vin] || 0), 0)),
      formatPrice(filteredSortedInventory.reduce((sum, item) => sum + (item.purchase_price + (reconditioningCosts[item.vin] || 0)), 0)),
      '',
      formatPrice(filteredSortedInventory.reduce((sum, item) => sum + (item.sale_price || 0), 0)),
      formatPrice(filteredSortedInventory.reduce((sum, item) => sum + (item.sale_status === 'sold' ? item.sale_price - (item.purchase_price + (reconditioningCosts[item.vin] || 0)) : 0), 0))
    ];

    doc.autoTable({
      startY: 100,
      head: [[
        'Purchase Date', 'Year', 'Make', 'Model', 'Trim', 'Mileage', 'Color', 'VIN',
        'Purchase Price', 'Title', 'Inspection', 'Recon Cost',
        'Total Cost', 'Date Sold', 'Sale Price', 'Profit', 'Status',
        'Issues', 'Notes'
      ]],
      body: [...tableData, totalsRow],
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 1 },
      margin: { top: 100 },
    });

    doc.save(`Inventory_${currentDate}.pdf`);
  };

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const handleDealCost = (vin) => {
    handleViewDeal(vin); // Assuming you want to use the same handler as the reconditioning cost click
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      {showAddSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          style={{
            position: 'fixed',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            background: 'linear-gradient(45deg, #4CAF50 30%, #81C784 90%)',
            color: 'white',
            padding: '16px 24px',
            borderRadius: '12px',
            boxShadow: '0 3px 5px 2px rgba(76, 175, 80, .3)',
          }}
        >
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
            Vehicle Successfully Added! 🚗
          </Typography>
        </motion.div>
      )}
      <Container maxWidth="lg">
        <Box mt={5}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            textAlign="left"
            fontWeight="bold"
            sx={{ 
              textTransform: 'uppercase', 
              letterSpacing: 2,
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
              mt: { xs: 2, md: 5 }
            }}
          >
            Your Inventory
          </Typography>

          <Box display="flex" gap={2} mb={3} sx={{
            flexDirection: { xs: 'column', md: 'row' },
            '& .MuiSelect-root, & .MuiTextField-root': {
              width: { xs: '100%', md: 'auto' }
            }
          }}>
            <Select
              value={filterSold}
              onChange={(e) => setFilterSold(e.target.value)}
              displayEmpty
              sx={{ minWidth: { xs: '100%', md: 150 } }}
            >
              <MenuItem value="available">Show Available</MenuItem>
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="sold">Show Sold</MenuItem>
            </Select>

            <Select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              displayEmpty
              sx={{ minWidth: { xs: '100%', md: 120 } }}
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
              sx={{ minWidth: { xs: '100%', md: 120 } }}
            >
              <MenuItem value="">All Years</MenuItem>
              {[2030, 2029, 2028, 2027, 2026, 2025, 2024, 2023, 2022, 2021].reverse().map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </Box>

          <Box display="flex" gap={2} mb={3} sx={{
            flexDirection: { xs: 'column', md: 'row' },
            '& .MuiTextField-root': {
              width: { xs: '100%', md: 'auto' }
            }
          }}>
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

          <Box display="flex" gap={2} mb={3} sx={{
            flexDirection: { xs: 'column', sm: 'row' },
            '& .MuiSelect-root': {
              width: { xs: '100%', sm: 'auto' }
            }
          }}>
            <Select value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
              <MenuItem value="vin">VIN</MenuItem>
              <MenuItem value="make">Make</MenuItem>
              <MenuItem value="model">Model</MenuItem>
              <MenuItem value="purchase_price">Purchase Price</MenuItem>
              <MenuItem value="sale_price">Sale Price</MenuItem>
              <MenuItem value="purchase_date">Purchase Date</MenuItem>
            </Select>
            <Button 
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} 
              variant="outlined"
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            </Button>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={2} sx={{
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 2, sm: 0 }
          }}>
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

          <Box mt={3}>
            <Box display="flex" justifyContent="flex-end" gap={2} mb={2}>
              <Button
                variant="contained"
                onClick={exportToExcel}
                sx={{
                  background: 'rgba(8, 11, 22, 0.85)',
                  backdropFilter: 'blur(12px)',
                  color: 'rgba(255, 255, 255, 0.9)',
                  '&:hover': {
                    background: 'rgba(8, 11, 22, 0.95)',
                  }
                }}
              >
                Export to Excel
              </Button>
              <Button
                variant="contained"
                onClick={exportToCSV}
                sx={{
                  background: 'rgba(8, 11, 22, 0.85)',
                  backdropFilter: 'blur(12px)',
                  color: 'rgba(255, 255, 255, 0.9)',
                  '&:hover': {
                    background: 'rgba(8, 11, 22, 0.95)',
                  }
                }}
              >
                Export to CSV
              </Button>
              <Button
                variant="contained"
                onClick={printToPDF}
                sx={{
                  background: 'rgba(8, 11, 22, 0.85)',
                  backdropFilter: 'blur(12px)',
                  color: 'rgba(255, 255, 255, 0.9)',
                  '&:hover': {
                    background: 'rgba(8, 11, 22, 0.95)',
                  }
                }}
              >
                Print to PDF
              </Button>
            </Box>

            <TableContainer 
              ref={tableContainerRef}
              component={Paper}
              sx={{ maxHeight: 'calc(100vh - 300px)', position: 'relative' }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ backgroundColor: '#424242', color: 'white', fontWeight: 'bold', position: 'sticky', top: 0, zIndex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        Purchase Date
                        <IconButton size="small" onClick={() => handleSort('purchase_date')}>
                          {sortKey === 'purchase_date' && (sortOrder === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ backgroundColor: '#424242', color: 'white', fontWeight: 'bold', position: 'sticky', top: 0, zIndex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        Year
                        <IconButton size="small" onClick={() => handleSort('year')}>
                          {sortKey === 'year' && (sortOrder === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ backgroundColor: '#424242', color: 'white', fontWeight: 'bold', position: 'sticky', top: 0, zIndex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        Make
                        <IconButton size="small" onClick={() => handleSort('make')}>
                          {sortKey === 'make' && (sortOrder === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ backgroundColor: '#424242', color: 'white', fontWeight: 'bold', position: 'sticky', top: 0, zIndex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        Model
                        <IconButton size="small" onClick={() => handleSort('model')}>
                          {sortKey === 'model' && (sortOrder === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ backgroundColor: '#424242', color: 'white', fontWeight: 'bold', position: 'sticky', top: 0, zIndex: 1 }}>Trim</TableCell>
                    <TableCell sx={{ backgroundColor: '#424242', color: 'white', fontWeight: 'bold', position: 'sticky', top: 0, zIndex: 1 }}>Mileage</TableCell>
                    <TableCell sx={{ backgroundColor: '#424242', color: 'white', fontWeight: 'bold', position: 'sticky', top: 0, zIndex: 1 }}>Color</TableCell>
                    <TableCell sx={{ backgroundColor: '#424242', color: 'white', fontWeight: 'bold', position: 'sticky', top: 0, zIndex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        VIN
                        <IconButton size="small" onClick={() => handleSort('vin')}>
                          {sortKey === 'vin' && (sortOrder === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ backgroundColor: '#424242', color: 'white', fontWeight: 'bold', position: 'sticky', top: 0, zIndex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        Purchase Price
                        <IconButton size="small" onClick={() => handleSort('purchase_price')}>
                          {sortKey === 'purchase_price' && (sortOrder === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ backgroundColor: '#424242', color: 'white', fontWeight: 'bold', position: 'sticky', top: 0, zIndex: 1 }}>Title Received?</TableCell>
                    <TableCell sx={{ backgroundColor: '#424242', color: 'white', fontWeight: 'bold', position: 'sticky', top: 0, zIndex: 1 }}>Inspection Completed?</TableCell>
                    <TableCell sx={{ backgroundColor: '#424242', color: 'white', fontWeight: 'bold', position: 'sticky', top: 0, zIndex: 1 }}>Reconditioning Cost</TableCell>
                    <TableCell sx={{ backgroundColor: '#424242', color: 'white', fontWeight: 'bold', position: 'sticky', top: 0, zIndex: 1 }}>Total Cost</TableCell>
                    <TableCell sx={{ backgroundColor: '#424242', color: 'white', fontWeight: 'bold', position: 'sticky', top: 0, zIndex: 1 }}>Date Sold</TableCell>
                    <TableCell sx={{ backgroundColor: '#424242', color: 'white', fontWeight: 'bold', position: 'sticky', top: 0, zIndex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        Sale Price
                        <IconButton size="small" onClick={() => handleSort('sale_price')}>
                          {sortKey === 'sale_price' && (sortOrder === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ backgroundColor: '#424242', color: 'white', fontWeight: 'bold', position: 'sticky', top: 0, zIndex: 1 }}>Gross Profit</TableCell>
                    <TableCell sx={{ backgroundColor: '#424242', color: 'white', fontWeight: 'bold', position: 'sticky', top: 0, zIndex: 1 }}>Vehicle Status</TableCell>
                    <TableCell sx={{ backgroundColor: '#424242', color: 'white', fontWeight: 'bold', position: 'sticky', top: 0, zIndex: 1 }}>Pending Issues</TableCell>
                    <TableCell sx={{ backgroundColor: '#424242', color: 'white', fontWeight: 'bold', position: 'sticky', top: 0, zIndex: 1 }}>Closing Statement</TableCell>
                    <TableCell sx={{ backgroundColor: '#424242', color: 'white', fontWeight: 'bold', position: 'sticky', top: 0, zIndex: 1 }}>Actions</TableCell>
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
                        <TableCell>{item.inspection_received || 'N/A'}</TableCell>
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
                          <Box display="flex" gap={1} justifyContent="center" sx={{
                            flexDirection: { xs: 'column', sm: 'row' },
                            '& .MuiButton-root': {
                              width: { xs: '100%', sm: 'auto' }
                            }
                          }}>
                            <Button 
                              variant="outlined" 
                              size="small"
                              onClick={() => handleDealCost(item.vin)}
                            >
                              DealCost
                            </Button>
                            <Button 
                              variant="outlined" 
                              size="small" 
                              onClick={() => handleOpen(item.vin)}
                            >
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
                    <TableCell colSpan={9} sx={{ textAlign: 'right', fontWeight: 'bold' }}>
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
          </Box>

          <Modal open={open} onClose={handleClose}>
            <Box
              sx={{
                width: { xs: '90%', sm: '600px' },
                margin: 'auto',
                mt: 5,
                p: 3,
                bgcolor: 'background.paper',
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
                width: { xs: '90%', sm: '600px' },
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