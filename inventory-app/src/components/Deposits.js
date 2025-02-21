import React, { useState, useEffect } from 'react';
import {
  Container, Box, Typography, Button, Grid, Paper,
  TextField, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Dialog, DialogContent,
  DialogActions, IconButton, Card, CardContent, Stack,
  Tooltip, alpha, FormControl, DialogTitle
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { motion, AnimatePresence } from 'framer-motion';

function Deposits() {
  const theme = useTheme();
  const [deposits, setDeposits] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDeposit, setEditingDeposit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalDeposits: 0,
    monthlyDeposits: 0,
    largestDeposit: 0,
    averageDeposit: 0
  });

  const [newDeposit, setNewDeposit] = useState({
    description: '',
    amount: '',
    date: new Date(),
    account: '',
    reference_number: '',
    username: localStorage.getItem('username')
  });

  useEffect(() => {
    fetchDeposits();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [deposits]);

  const fetchDeposits = async () => {
    try {
      const username = localStorage.getItem('username');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/deposits?username=${username}`);
      const data = await response.json();
      if (response.ok) {
        setDeposits(data.deposits);
      }
    } catch (error) {
      console.error('Error fetching deposits:', error);
    }
  };

  const calculateStats = () => {
    if (!deposits.length) return;

    const total = deposits.reduce((sum, dep) => sum + parseFloat(dep.amount || 0), 0);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyTotal = deposits
      .filter(dep => {
        const depDate = new Date(dep.date);
        return depDate.getMonth() === currentMonth && depDate.getFullYear() === currentYear;
      })
      .reduce((sum, dep) => sum + parseFloat(dep.amount || 0), 0);

    const largest = Math.max(...deposits.map(dep => parseFloat(dep.amount || 0)));
    const average = total / deposits.length;

    setStats({
      totalDeposits: total.toFixed(2),
      monthlyDeposits: monthlyTotal.toFixed(2),
      largestDeposit: largest.toFixed(2),
      averageDeposit: average.toFixed(2)
    });
  };

  const handleAddDeposit = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/deposits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDeposit)
      });
      
      if (response.ok) {
        await fetchDeposits();
        setOpenDialog(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error adding deposit:', error);
    }
  };

  const handleEditDeposit = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/deposits/${editingDeposit._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDeposit)
      });
      
      if (response.ok) {
        await fetchDeposits();
        setOpenDialog(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error updating deposit:', error);
    }
  };

  const handleDeleteDeposit = async (depositId) => {
    if (!window.confirm('Are you sure you want to delete this deposit?')) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/deposits/${depositId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await fetchDeposits();
      }
    } catch (error) {
      console.error('Error deleting deposit:', error);
    }
  };

  const resetForm = () => {
    setNewDeposit({
      description: '',
      amount: '',
      date: new Date(),
      account: '',
      reference_number: '',
      username: localStorage.getItem('username')
    });
    setEditingDeposit(null);
  };

  const handleOpenEdit = (deposit) => {
    setEditingDeposit(deposit);
    setNewDeposit({
      ...deposit,
      date: new Date(deposit.date)
    });
    setOpenDialog(true);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h4" component="h1" gutterBottom>
              Deposit Records
            </Typography>
          </Grid>

          {/* Stats Cards */}
          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <AccountBalanceIcon color="primary" />
                  <Box>
                    <Typography variant="h6">${stats.totalDeposits}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Deposits
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
                    <Typography variant="h6">${stats.monthlyDeposits}</Typography>
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
                    <Typography variant="h6">${stats.largestDeposit}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Largest Deposit
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
                  <AccountBalanceIcon color="info" />
                  <Box>
                    <Typography variant="h6">${stats.averageDeposit}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Average Deposit
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
                label="Search Deposits"
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
                Add Deposit
              </Button>
            </Box>
          </Grid>

          {/* Deposits Table */}
          <Grid item xs={12}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Account</TableCell>
                    <TableCell>Reference Number</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <AnimatePresence>
                    {deposits.map((deposit, index) => (
                      <motion.tr
                        key={deposit._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <TableCell>{format(new Date(deposit.date), 'MM/dd/yyyy')}</TableCell>
                        <TableCell>{deposit.description}</TableCell>
                        <TableCell>{deposit.account}</TableCell>
                        <TableCell>{deposit.reference_number}</TableCell>
                        <TableCell align="right">${parseFloat(deposit.amount).toFixed(2)}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton onClick={() => handleOpenEdit(deposit)}>
                              <EditIcon />
                            </IconButton>
                            <IconButton onClick={() => handleDeleteDeposit(deposit._id)}>
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </Box>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingDeposit ? 'Edit Deposit' : 'Add New Deposit'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Description"
              value={newDeposit.description}
              onChange={(e) => setNewDeposit({ ...newDeposit, description: e.target.value })}
            />
            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={newDeposit.amount}
              onChange={(e) => setNewDeposit({ ...newDeposit, amount: e.target.value })}
            />
            <DatePicker
              selected={newDeposit.date}
              onChange={(date) => setNewDeposit({ ...newDeposit, date: date })}
              customInput={<TextField fullWidth label="Date" />}
            />
            <TextField
              fullWidth
              label="Account"
              value={newDeposit.account}
              onChange={(e) => setNewDeposit({ ...newDeposit, account: e.target.value })}
            />
            <TextField
              fullWidth
              label="Reference Number"
              value={newDeposit.reference_number}
              onChange={(e) => setNewDeposit({ ...newDeposit, reference_number: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={editingDeposit ? handleEditDeposit : handleAddDeposit}
            variant="contained"
          >
            {editingDeposit ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Deposits;
