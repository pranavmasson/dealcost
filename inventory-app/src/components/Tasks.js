import React, { useState, useEffect } from 'react';
import {
  Container, Box, Typography, Button, Grid, Paper, TextField,
  Select, MenuItem, FormControl, InputLabel, Chip, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RestoreIcon from '@mui/icons-material/Restore';
import { format } from 'date-fns';
import { alpha, useTheme } from '@mui/material/styles';

function Tasks() {
  const theme = useTheme();
  const [tasks, setTasks] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    dateAssigned: new Date(),
    dueDate: new Date(),
    status: 'pending',
    completedDate: null,
    username: localStorage.getItem('username')
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const username = localStorage.getItem('username');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/tasks?username=${username}`);
      const data = await response.json();
      if (response.ok) {
        setTasks(data.tasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleAddTask = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      });
      
      if (response.ok) {
        fetchTasks();
        setOpenDialog(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleEditTask = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/tasks/${editingTask._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      });
      
      if (response.ok) {
        fetchTasks();
        setOpenDialog(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/tasks/${taskId}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'completed',
          completedDate: new Date().toISOString()  // Format date as ISO string
        })
      });
      
      if (response.ok) {
        await fetchTasks();  // Make sure to await the fetch
      } else {
        console.error('Failed to complete task');
      }
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const handleReopenTask = async (taskId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/tasks/${taskId}/reopen`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'pending',
          completedDate: null
        })
      });
      
      if (response.ok) {
        await fetchTasks();
      } else {
        console.error('Failed to reopen task');
      }
    } catch (error) {
      console.error('Error reopening task:', error);
    }
  };

  const resetForm = () => {
    setNewTask({
      title: '',
      description: '',
      assignedTo: '',
      dateAssigned: new Date(),
      dueDate: new Date(),
      status: 'pending',
      completedDate: null,
      username: localStorage.getItem('username')
    });
    setEditingTask(null);
  };

  const handleOpenEdit = (task) => {
    setEditingTask(task);
    setNewTask({
      ...task,
      dateAssigned: new Date(task.dateAssigned),
      dueDate: task.dueDate ? new Date(task.dueDate) : new Date(),
    });
    setOpenDialog(true);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return format(new Date(date), 'MM/dd/yyyy');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const calculateTaskDuration = (task) => {
    if (!task.dateAssigned) return 'N/A';
    
    try {
      if (!task.completedDate) {
        const now = new Date();
        const start = new Date(task.dateAssigned);
        const days = Math.round((now - start) / (1000 * 60 * 60 * 24));
        return `${days} days so far`;
      }
      const start = new Date(task.dateAssigned);
      const end = new Date(task.completedDate);
      const days = Math.round((end - start) / (1000 * 60 * 60 * 24));
      return `${days} days`;
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatStatus = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const filteredTasks = tasks.filter(task => {
    if (!showHistory && task.status !== 'pending') return false;
    
    if (searchTerm === '') return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      task.title?.toLowerCase().includes(searchLower) ||
      task.description?.toLowerCase().includes(searchLower) ||
      task.assignedTo?.toLowerCase().includes(searchLower) ||
      formatDate(task.dateAssigned).toLowerCase().includes(searchLower) ||
      formatDate(task.dueDate).toLowerCase().includes(searchLower) ||
      task.status?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3} alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="h4" component="h1">Tasks Management</Typography>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                resetForm();
                setOpenDialog(true);
              }}
            >
              Add New Task
            </Button>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Search Tasks"
                placeholder="Search in all fields..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                variant="outlined"
                onClick={() => setShowHistory(!showHistory)}
              >
                {showHistory ? 'Show Active Tasks' : 'Show Task History'}
              </Button>
            </Grid>
          </Grid>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Date Assigned</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTasks.map(task => (
                <TableRow 
                  key={task._id}
                  sx={{
                    backgroundColor: task.status === 'completed' 
                      ? alpha(theme.palette.success.main, 0.1)
                      : task.dueDate && new Date(task.dueDate) < new Date() && task.status === 'pending'
                      ? alpha(theme.palette.error.main, 0.1)
                      : 'inherit'
                  }}
                >
                  <TableCell>{task.title}</TableCell>
                  <TableCell>{task.description}</TableCell>
                  <TableCell>{task.assignedTo}</TableCell>
                  <TableCell>{formatDate(task.dateAssigned)}</TableCell>
                  <TableCell>{formatDate(task.dueDate)}</TableCell>
                  <TableCell>{formatStatus(task.status)}</TableCell>
                  <TableCell>{calculateTaskDuration(task)}</TableCell>
                  <TableCell>
                    {task.status === 'pending' ? (
                      <>
                        <IconButton onClick={() => handleCompleteTask(task._id)}>
                          <CheckCircleIcon color="success" />
                        </IconButton>
                        <IconButton onClick={() => handleOpenEdit(task)}>
                          <EditIcon color="primary" />
                        </IconButton>
                      </>
                    ) : (
                      <IconButton 
                        onClick={() => handleReopenTask(task._id)}
                        title="Reopen Task"
                      >
                        <RestoreIcon color="primary" />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Task Title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={4}
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Assign To"
              value={newTask.assignedTo}
              onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
              sx={{ mb: 2 }}
            />
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  selected={newTask.dateAssigned}
                  onChange={(date) => setNewTask({ ...newTask, dateAssigned: date })}
                  customInput={<TextField fullWidth label="Date Assigned" />}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  selected={newTask.dueDate}
                  onChange={(date) => setNewTask({ ...newTask, dueDate: date })}
                  customInput={<TextField fullWidth label="Due Date" />}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={editingTask ? handleEditTask : handleAddTask} 
            variant="contained"
          >
            {editingTask ? 'Update Task' : 'Add Task'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Tasks;
