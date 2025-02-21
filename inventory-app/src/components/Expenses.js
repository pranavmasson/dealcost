import React, { useState, useEffect } from 'react';
import {
  Container, Box, Typography, Button, Grid, Paper,
  TextField, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, Card, CardContent, Stack,
  Tooltip, alpha, Select, MenuItem, FormControl,
  InputLabel, Chip, Collapse
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ReceiptIcon from '@mui/icons-material/Receipt';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { startOfDay, endOfDay, isWithinInterval } from 'date-fns';

function Expenses() {
  const theme = useTheme();
  const [expenses, setExpenses] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalExpenses: 0,
    monthlyExpenses: 0,
    largestExpense: 0,
    averageExpense: 0
  });

  const [newExpense, setNewExpense] = useState({
    itemNumber: '',
    description: '',
    amount: '',
    date: new Date(),
    username: localStorage.getItem('username')
  });

  const [sortField, setSortField] = useState('itemNumber');
  const [sortOrder, setSortOrder] = useState('desc');
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null
  });
  const [priceRange, setPriceRange] = useState({
    min: '',
    max: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchExpenses();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [expenses]);

  const fetchExpenses = async () => {
    try {
      const username = localStorage.getItem('username');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/expenses?username=${username}`);
      const data = await response.json();
      if (response.ok) {
        setExpenses(data.expenses);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const calculateStats = () => {
    if (!expenses.length) return;

    const total = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyTotal = expenses
      .filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
      })
      .reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);

    const largest = Math.max(...expenses.map(exp => parseFloat(exp.amount || 0)));
    const average = total / expenses.length;

    setStats({
      totalExpenses: total.toFixed(2),
      monthlyExpenses: monthlyTotal.toFixed(2),
      largestExpense: largest.toFixed(2),
      averageExpense: average.toFixed(2)
    });
  };

  const handleAddExpense = async () => {
    try {
      const nextItemNumber = expenses.length > 0 
        ? Math.max(...expenses.map(exp => parseInt(exp.itemNumber) || 0)) + 1 
        : 1;

      const expenseToAdd = {
        ...newExpense,
        itemNumber: nextItemNumber.toString()
      };

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseToAdd)
      });
      
      if (response.ok) {
        await fetchExpenses();
        setOpenDialog(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const handleEditExpense = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/expenses/${editingExpense._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExpense)
      });
      
      if (response.ok) {
        await fetchExpenses();
        setOpenDialog(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/expenses/${expenseId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await fetchExpenses();
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const resetForm = () => {
    setNewExpense({
      itemNumber: '',
      description: '',
      amount: '',
      date: new Date(),
      username: localStorage.getItem('username')
    });
    setEditingExpense(null);
  };

  const handleOpenEdit = (expense) => {
    setEditingExpense(expense);
    setNewExpense({
      ...expense,
      date: new Date(expense.date)
    });
    setOpenDialog(true);
  };

  const sortExpenses = (expenses) => {
    return [...expenses].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'amount' || sortField === 'itemNumber') {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      }
      if (sortField === 'date') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  };

  const filteredExpenses = expenses.filter(expense => {
    if (searchTerm !== '') {
      const searchLower = searchTerm.toLowerCase();
      if (!expense.description?.toLowerCase().includes(searchLower) &&
          !expense.itemNumber?.toString().includes(searchLower) &&
          !expense.amount?.toString().includes(searchLower)) {
        return false;
      }
    }

    if (dateRange.startDate && dateRange.endDate) {
      const expenseDate = new Date(expense.date);
      if (!isWithinInterval(expenseDate, {
        start: startOfDay(dateRange.startDate),
        end: endOfDay(dateRange.endDate)
      })) {
        return false;
      }
    }

    const amount = parseFloat(expense.amount);
    if (priceRange.min && amount < parseFloat(priceRange.min)) return false;
    if (priceRange.max && amount > parseFloat(priceRange.max)) return false;

    return true;
  });

  const sortedAndFilteredExpenses = sortExpenses(filteredExpenses);

  const clearFilters = () => {
    setDateRange({ startDate: null, endDate: null });
    setPriceRange({ min: '', max: '' });
    setSortField('itemNumber');
    setSortOrder('desc');
    setSearchTerm('');
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h4" component="h1" gutterBottom>
             Admin Costs
            </Typography>
          </Grid>

          {/* Stats Cards */}
          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <AttachMoneyIcon color="primary" />
                  <Box>
                    <Typography variant="h6">${stats.totalExpenses}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Expenses
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: alpha(theme.palette.success.main, 0.1) }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <TrendingUpIcon color="success" />
                  <Box>
                    <Typography variant="h6">${stats.monthlyExpenses}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      This Month
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1) }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <ReceiptIcon color="warning" />
                  <Box>
                    <Typography variant="h6">${stats.largestExpense}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Largest Expense
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: alpha(theme.palette.info.main, 0.1) }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <AttachMoneyIcon color="info" />
                  <Box>
                    <Typography variant="h6">${stats.averageExpense}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Average Expense
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Search and Add Button */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Search Expenses"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  resetForm();
                  setOpenDialog(true);
                }}
              >
                Add Expense
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ mb: 3 }}>
              <Button
                startIcon={<FilterListIcon />}
                onClick={() => setShowFilters(!showFilters)}
                variant="outlined"
                sx={{ mr: 1 }}
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
              {(dateRange.startDate || priceRange.min || priceRange.max || sortField !== 'itemNumber') && (
                <Button
                  onClick={clearFilters}
                  color="secondary"
                  variant="outlined"
                >
                  Clear Filters
                </Button>
              )}
            </Box>

            <Collapse in={showFilters}>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>Sort By</InputLabel>
                      <Select
                        value={sortField}
                        onChange={(e) => setSortField(e.target.value)}
                        label="Sort By"
                      >
                        <MenuItem value="itemNumber">Item Number</MenuItem>
                        <MenuItem value="date">Date</MenuItem>
                        <MenuItem value="amount">Amount</MenuItem>
                        <MenuItem value="description">Description</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>Order</InputLabel>
                      <Select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        label="Order"
                      >
                        <MenuItem value="asc">Ascending</MenuItem>
                        <MenuItem value="desc">Descending</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <DatePicker
                      selected={dateRange.startDate}
                      onChange={(date) => setDateRange({ ...dateRange, startDate: date })}
                      customInput={<TextField fullWidth label="Start Date" />}
                      selectsStart
                      startDate={dateRange.startDate}
                      endDate={dateRange.endDate}
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <DatePicker
                      selected={dateRange.endDate}
                      onChange={(date) => setDateRange({ ...dateRange, endDate: date })}
                      customInput={<TextField fullWidth label="End Date" />}
                      selectsEnd
                      startDate={dateRange.startDate}
                      endDate={dateRange.endDate}
                      minDate={dateRange.startDate}
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Min Amount"
                      type="number"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Max Amount"
                      type="number"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                    />
                  </Grid>
                </Grid>

                {/* Active Filters Display */}
                <Box sx={{ mt: 2 }}>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {dateRange.startDate && dateRange.endDate && (
                      <Chip
                        label={`Date: ${format(dateRange.startDate, 'MM/dd/yyyy')} - ${format(dateRange.endDate, 'MM/dd/yyyy')}`}
                        onDelete={() => setDateRange({ startDate: null, endDate: null })}
                      />
                    )}
                    {priceRange.min && (
                      <Chip
                        label={`Min: $${priceRange.min}`}
                        onDelete={() => setPriceRange({ ...priceRange, min: '' })}
                      />
                    )}
                    {priceRange.max && (
                      <Chip
                        label={`Max: $${priceRange.max}`}
                        onDelete={() => setPriceRange({ ...priceRange, max: '' })}
                      />
                    )}
                    {sortField !== 'itemNumber' && (
                      <Chip
                        label={`Sorted by: ${sortField} (${sortOrder})`}
                        onDelete={() => {
                          setSortField('itemNumber');
                          setSortOrder('desc');
                        }}
                      />
                    )}
                  </Stack>
                </Box>
              </Paper>
            </Collapse>
          </Grid>

          {/* Expenses Table */}
          <Grid item xs={12}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Item #</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Amount (USD)</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedAndFilteredExpenses.map((expense) => (
                    <TableRow key={expense._id}>
                      <TableCell>{expense.itemNumber}</TableCell>
                      <TableCell>{expense.description}</TableCell>
                      <TableCell align="right">${parseFloat(expense.amount).toFixed(2)}</TableCell>
                      <TableCell>{format(new Date(expense.date), 'MM/dd/yyyy')}</TableCell>
                      <TableCell>
                        <Tooltip title="Edit">
                          <IconButton onClick={() => handleOpenEdit(expense)}>
                            <EditIcon color="primary" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton onClick={() => handleDeleteExpense(expense._id)}>
                            <DeleteIcon color="error" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </Box>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingExpense ? 'Edit Expense' : 'Add New Expense'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {editingExpense && (
              <TextField
                fullWidth
                label="Item Number"
                value={editingExpense.itemNumber}
                disabled
              />
            )}
            <TextField
              fullWidth
              label="Description"
              value={newExpense.description}
              onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
            />
            <TextField
              fullWidth
              label="Amount (USD)"
              type="number"
              value={newExpense.amount}
              onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
            />
            <DatePicker
              selected={newExpense.date}
              onChange={(date) => setNewExpense({ ...newExpense, date: date })}
              customInput={<TextField fullWidth label="Date" />}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={editingExpense ? handleEditExpense : handleAddExpense}
            variant="contained"
          >
            {editingExpense ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Expenses;
