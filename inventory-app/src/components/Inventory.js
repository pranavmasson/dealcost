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
  Collapse,
  alpha,
  CircularProgress,
  Grid,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { motion } from 'framer-motion'; // Import framer-motion for animations
import Modal from '@mui/material/Modal';
import EditCar from './EditCar';
import EnterDetailsManually from './EnterDetailsManually';
import Tooltip from '@mui/material/Tooltip';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format, differenceInDays } from 'date-fns';
import { useTheme } from '@mui/material/styles';

function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [error, setError] = useState('');
  const [showSold, setShowSold] = useState(false);
  const [sortKey, setSortKey] = useState(() => {
    return localStorage.getItem('inventorySortKey') || 'days_in_inventory';
  });
  const [sortOrder, setSortOrder] = useState(() => {
    return localStorage.getItem('inventorySortOrder') || 'asc';
  });
  const [keyword, setKeyword] = useState(() => {
    return localStorage.getItem('inventoryKeyword') || '';
  });
  const [reconditioningCosts, setReconditioningCosts] = useState({});
  const tableContainerRef = useRef(null);

  const [filterSold, setFilterSold] = useState(() => {
    return localStorage.getItem('inventoryFilterSold') || 'available';
  });
  const [filterMonth, setFilterMonth] = useState(() => {
    return localStorage.getItem('inventoryFilterMonth') || '';
  });
  const [filterYear, setFilterYear] = useState(() => {
    return localStorage.getItem('inventoryFilterYear') || '';
  });

  const [open, setOpen] = useState(false); // Manage modal visibility
  const [selectedVin, setSelectedVin] = useState(null); // Track selected VIN

  const [manualEntryOpen, setManualEntryOpen] = useState(false);
  const [manualEntryVin, setManualEntryVin] = useState(null);

  const [showAddSuccess, setShowAddSuccess] = useState(false);

  const [isControlsExpanded, setIsControlsExpanded] = useState(false);

  const [loading, setLoading] = useState(false);

  const theme = useTheme();
  const [reports, setReports] = useState([]);

  const [filterState, setFilterState] = useState(() => {
    const savedState = localStorage.getItem('inventoryFilterState');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      return parsed;
    }
    return {
      keyword: '',
      filterSold: 'available',
      filterMonth: '',
      filterYear: '',
      sortKey: 'days_in_inventory',
      sortOrder: 'asc',
      isControlsExpanded: false
    };
  });

  const handleOpenManualEntry = (vin) => {
    setManualEntryVin(vin);
    setManualEntryOpen(true);
  };

  const handleCloseManualEntry = () => {
    setManualEntryOpen(false);
    setManualEntryVin(null);
  };

  const navigate = useNavigate();
  const location = useLocation();

  const modalAnimation = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.3 } },
  };

  const fetchInventory = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  useEffect(() => {
    if (location.state?.refresh) {
      fetchInventory();
      navigate('/inventory', { replace: true, state: {} });
    }
  }, [location.state]);

  const calculateReconditioningCosts = async (inventory, username) => {
    const costs = {};
    for (const item of inventory) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/reports?vin=${item.vin}&username=${username}`);
        if (!response.ok) {
          console.error(`Failed to fetch reconditioning costs for VIN ${item.vin}: ${response.statusText}`);
          continue;
        }
        const data = await response.json();
        const totalCost = data.records.reduce((sum, record) => sum + parseFloat(record.cost || 0), 0);
        costs[item.vin] = totalCost;
      } catch (error) {
        console.error(`Error fetching reconditioning costs for VIN ${item.vin}:`, error);
        costs[item.vin] = 0;
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

  const formatPrice = (price) => {
    if (price === null || price === undefined || isNaN(price)) {
      return 'N/A';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      notation: 'standard'
    }).format(Number(price));
  };

  const calculateDaysInInventory = (item) => {
    const purchaseDate = new Date(item.purchase_date);
    const endDate = item.sale_status === 'sold' ? new Date(item.date_sold) : new Date();
    return differenceInDays(endDate, purchaseDate);
  };

  const sortInventory = (a, b) => {
    if (sortKey === 'days_in_inventory') {
      const daysA = calculateDaysInInventory(a);
      const daysB = calculateDaysInInventory(b);
      return sortOrder === 'asc' ? daysA - daysB : daysB - daysA;
    } else if (sortKey === 'purchase_date') {
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
      return keyword
        ? Object.values(item).some((value) =>
          value ? value.toString().toLowerCase().includes(keyword.toLowerCase()) : false
        )
        : true;
    })
    .sort(sortInventory);

  const scrollHorizontally = (direction) => {
    if (tableContainerRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      const currentScroll = tableContainerRef.current.scrollLeft;
      tableContainerRef.current.scrollTo({
        left: currentScroll + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const scrollVertically = (direction) => {
    if (tableContainerRef.current) {
      const scrollAmount = direction === 'up' ? -300 : 300;
      tableContainerRef.current.scrollBy({
        top: scrollAmount,
        behavior: 'smooth'
      });
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
        'Purchase Price', 'Purchase Fund', 'Title Received?', 'Inspection Completed?', 'Reconditioning Cost',
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
        item.finance_type || 'N/A',
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
    csvContent += 'Purchase Date,Year,Make,Model,Trim,Mileage,Color,VIN,Purchase Price,Purchase Fund,Title Received?,Inspection Completed?,Reconditioning Cost,Total Cost,Date Sold,Sale Price,Gross Profit,Vehicle Status,Pending Issues,Closing Statement\n';

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
        item.finance_type || 'N/A',
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

    // Set consistent margins
    const margin = 20; // Reduced margin
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header styling - smaller text
    doc.setFontSize(16); // Reduced from 20
    doc.setTextColor(0, 32, 96);
    doc.text(companyName || 'Inventory Report', margin, margin);
    
    doc.setFontSize(10); // Reduced from 12
    doc.setTextColor(60, 60, 60);
    doc.text(`Address: ${companyAddress || ''}`, margin, margin + 20);
    doc.text(`Run Date: ${currentDate}`, margin, margin + 35);

    // Table configuration with all columns
    const tableConfig = {
      startY: margin + 50, // Reduced top spacing
      head: [[
        'Purchase Date', 'Year', 'Make', 'Model', 'Trim', 'Mileage', 'Color', 'VIN',
        'Purchase Price', 'Purchase Fund', 'Title?', 'Inspection?', 'Recon Cost',
        'Total Cost', 'Date Sold', 'Sale Price', 'Profit', 'Status',
        'Pending Issues', 'Closing Statement'
      ]],
      body: filteredSortedInventory.map(item => {
        const reconditionCost = reconditioningCosts[item.vin] || 0;
        const totalCost = item.purchase_price + reconditionCost;
        const profit = item.sale_status === 'sold' ? item.sale_price - totalCost : 'N/A';

        return [
          item.purchase_date || 'N/A',
          item.year || 'N/A',
          item.make || 'N/A',
          item.model || 'N/A',
          item.trim || 'N/A',
          item.mileage || 'N/A',
          item.color || 'N/A',
          item.vin || 'N/A',
          formatPrice(item.purchase_price),
          item.finance_type || 'N/A',
          item.title_received || 'N/A',
          item.inspection_received || 'N/A',
          formatPrice(reconditionCost),
          formatPrice(totalCost),
          item.date_sold || 'N/A',
          formatPrice(item.sale_price || 0),
          typeof profit === 'number' ? formatPrice(profit) : 'N/A',
          item.sale_status || 'N/A',
          item.pending_issues || 'N/A',
          item.closing_statement || 'N/A'
        ];
      }),
      foot: [[
        'TOTALS', '', '', '', '', '', '', '',
        formatPrice(filteredSortedInventory.reduce((sum, item) => sum + item.purchase_price, 0)),
        '', '',
        formatPrice(filteredSortedInventory.reduce((sum, item) => sum + (reconditioningCosts[item.vin] || 0), 0)),
        formatPrice(filteredSortedInventory.reduce((sum, item) => sum + (item.purchase_price + (reconditioningCosts[item.vin] || 0)), 0)),
        '',
        formatPrice(filteredSortedInventory.reduce((sum, item) => 
          sum + Number(item.sale_price || 0)
        , 0)),
        formatPrice(filteredSortedInventory.reduce((sum, item) => {
          if (item.sale_status === 'sold') {
            const totalCost = item.purchase_price + (reconditioningCosts[item.vin] || 0);
            return sum + ((item.sale_price || 0) - totalCost);
          }
          return sum;
        }, 0)),
        '', '', ''
      ]],
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 6, // Reduced from 8
        cellPadding: 2, // Reduced from 4
        lineColor: [0, 32, 96],
        lineWidth: 0.5,
        overflow: 'linebreak'
      },
      headStyles: {
        fillColor: [0, 32, 96],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 7 // Slightly larger than body text
      },
      bodyStyles: {
        textColor: [60, 60, 60],
        halign: 'center'
      },
      footStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 32, 96],
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        // Set specific widths for columns that need it
        0: { cellWidth: 45 }, // Purchase Date
        1: { cellWidth: 25 }, // Year
        2: { cellWidth: 35 }, // Make
        3: { cellWidth: 40 }, // Model
        4: { cellWidth: 35 }, // Trim
        5: { cellWidth: 35 }, // Mileage
        6: { cellWidth: 35 }, // Color
        7: { cellWidth: 60 }, // VIN
        8: { cellWidth: 45 }, // Purchase Price
        9: { cellWidth: 45 }, // Purchase Fund
        10: { cellWidth: 25 }, // Title
        11: { cellWidth: 35 }, // Inspection
        12: { cellWidth: 40 }, // Recon Cost
        13: { cellWidth: 40 }, // Total Cost
        14: { cellWidth: 40 }, // Date Sold
        15: { cellWidth: 40 }, // Sale Price
        16: { cellWidth: 40 }, // Profit
        17: { cellWidth: 35 }, // Status
        18: { cellWidth: 35 }, // Pending Issues
        19: { cellWidth: 45 }  // Closing Statement
      },
      margin: { left: margin, right: margin },
      didDrawPage: function(data) {
        // Add page numbers
        doc.setFontSize(7);
        doc.setTextColor(60, 60, 60);
        doc.text(
          `Page ${doc.internal.getNumberOfPages()}`,
          pageWidth - margin,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'right' }
        );
      }
    };

    doc.autoTable(tableConfig);
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

  const handleDealCost = (vin) => navigate(`/view-deal/${vin}`);

  const calculateAverageProfitPerCar = (inventory, reports, reconditioningCosts) => {
    const soldCars = inventory.filter(car => car.sale_status === 'sold');
    if (!soldCars.length) return 0;
    
    const totalProfit = soldCars.reduce((sum, car) => {
      const reconditioningCost = reconditioningCosts[car.vin] || 0;
      const salePrice = parseFloat(car.sale_price || 0);
      const purchasePrice = parseFloat(car.purchase_price || 0);
      const profit = salePrice - purchasePrice - reconditioningCost;
      return sum + profit;
    }, 0);

    return totalProfit / soldCars.length;
  };

  const calculateAverageProfitByPurchaser = (inventory, reports, reconditioningCosts) => {
    const soldCars = inventory.filter(car => car.sale_status === 'sold');
    
    const purchaserProfits = soldCars.reduce((acc, car) => {
      const purchaser = car.purchaser || 'Unknown';
      if (!acc[purchaser]) {
        acc[purchaser] = {
          totalProfit: 0,
          count: 0
        };
      }

      const reconditioningCost = reconditioningCosts[car.vin] || 0;
      const salePrice = parseFloat(car.sale_price || 0);
      const purchasePrice = parseFloat(car.purchase_price || 0);
      const profit = salePrice - purchasePrice - reconditioningCost;

      acc[purchaser].totalProfit += profit;
      acc[purchaser].count += 1;
      return acc;
    }, {});

    return Object.entries(purchaserProfits).map(([purchaser, data]) => ({
      purchaser,
      averageProfit: data.totalProfit / data.count,
      numberOfCars: data.count
    }));
  };

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const username = localStorage.getItem('username');
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/reports?username=${username}`);
        if (response.ok) {
          const data = await response.json();
          setReports(data);
        }
      } catch (error) {
        console.error('Error fetching reports:', error);
      }
    };

    fetchReports();
  }, []);

  const splitHeaderText = (text) => {
    if (text === 'Reconditioning Cost') return 'Reconditioning\nCost';
    if (text.length <= 12) return text;
    
    const words = text.split(' ');
    let firstLine = '';
    let secondLine = '';
    
    if (words.length === 1) {
      const midpoint = Math.ceil(text.length / 2);
      return `${text.slice(0, midpoint)}\n${text.slice(midpoint)}`;
    }
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      if (firstLine.length + word.length <= 12 && firstLine.length <= secondLine.length) {
        firstLine += (firstLine ? ' ' : '') + word;
      } else {
        secondLine += (secondLine ? ' ' : '') + word;
      }
    }
    
    return `${firstLine}\n${secondLine}`;
  };

  useEffect(() => {
    const currentState = {
      keyword,
      filterSold,
      filterMonth,
      filterYear,
      sortKey,
      sortOrder,
      isControlsExpanded
    };
    localStorage.setItem('inventoryFilterState', JSON.stringify(currentState));
  }, [keyword, filterSold, filterMonth, filterYear, sortKey, sortOrder, isControlsExpanded]);

  // Save filter states whenever they change
  useEffect(() => {
    localStorage.setItem('inventoryKeyword', keyword);
    localStorage.setItem('inventoryFilterSold', filterSold);
    localStorage.setItem('inventoryFilterMonth', filterMonth);
    localStorage.setItem('inventoryFilterYear', filterYear);
    localStorage.setItem('inventorySortKey', sortKey);
    localStorage.setItem('inventorySortOrder', sortOrder);
  }, [keyword, filterSold, filterMonth, filterYear, sortKey, sortOrder]);

  // Clear filters only when navigating away from inventory (not to view-deal)
  useEffect(() => {
    return () => {
      if (!window.location.pathname.includes('/view-deal')) {
        localStorage.removeItem('inventoryKeyword');
        localStorage.removeItem('inventoryFilterSold');
        localStorage.removeItem('inventoryFilterMonth');
        localStorage.removeItem('inventoryFilterYear');
        localStorage.removeItem('inventorySortKey');
        localStorage.removeItem('inventorySortOrder');
      }
    };
  }, []);

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
      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 }, maxWidth: '95vw' }}>
        <Box mt={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 2,
              background: theme => `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`
            }}
          >
            <Box 
              onClick={() => setIsControlsExpanded(!isControlsExpanded)}
              sx={{ 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Typography variant="h6" component="div">
                Filter & Sort
              </Typography>
              {isControlsExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </Box>

            <Collapse in={isControlsExpanded}>
              <Box mt={2}>
                <Box 
                  display="flex" 
                  gap={1.5} 
                  mb={2} 
                  alignItems="center"
                  sx={{
                    flexDirection: { xs: 'row', md: 'row' },
                    flexWrap: 'wrap',
                    '& .MuiTextField-root, & .MuiSelect-root': {
                      minHeight: '36px',
                      height: '36px',
                    },
                    '& .MuiInputBase-root': {
                      fontSize: '0.875rem',
                    },
                    '& .MuiButton-root': {
                      height: '36px',
                      fontSize: '0.875rem',
                      padding: '6px 12px',
                    },
                    '& .MuiTypography-root': {
                      fontSize: '0.875rem',
                    }
                  }}
                >
                  {/* Search Group */}
                  <TextField 
                    placeholder="Search" 
                    value={keyword} 
                    onChange={(e) => setKeyword(e.target.value)}
                    size="small"
                    sx={{ width: '150px' }}
                  />

                  {/* Status */}
                  <Select
                    value={filterSold}
                    onChange={(e) => setFilterSold(e.target.value)}
                    displayEmpty
                    size="small"
                    sx={{ width: '140px' }}
                  >
                    <MenuItem value="available">Show Available</MenuItem>
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="sold">Show Sold</MenuItem>
                  </Select>

                  {/* Time Period */}
                  <Select
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(e.target.value)}
                    displayEmpty
                    size="small"
                    sx={{ width: '120px' }}
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
                    size="small"
                    sx={{ width: '100px' }}
                  >
                    <MenuItem value="">All Years</MenuItem>
                    {[2024, 2023, 2022, 2021].map((year) => (
                      <MenuItem key={year} value={year}>{year}</MenuItem>
                    ))}
                  </Select>

                  {/* Sort */}
                  <Select 
                    value={sortKey} 
                    onChange={(e) => setSortKey(e.target.value)}
                    size="small"
                    sx={{ width: '160px' }}
                  >
                    <MenuItem value="days_in_inventory">Days in Inventory</MenuItem>
                    <MenuItem value="vin">VIN</MenuItem>
                    <MenuItem value="make">Make</MenuItem>
                    <MenuItem value="model">Model</MenuItem>
                  </Select>

                  <Button 
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    variant="outlined"
                    size="small"
                  >
                    {sortOrder === 'asc' ? 'ASCENDING' : 'DESCENDING'}
                  </Button>

                  {/* Export Buttons */}
                  <Button size="small" onClick={exportToExcel}>EXCEL</Button>
                  <Button size="small" onClick={exportToCSV}>CSV</Button>
                  <Button size="small" onClick={printToPDF}>PDF</Button>
                </Box>
              </Box>
            </Collapse>
          </Paper>

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

          <Box mt={2}>
            <TableContainer 
              ref={tableContainerRef}
              component={Paper}
              sx={{ 
                maxHeight: isControlsExpanded ? 
                  { xs: 'calc(100vh - 500px)', sm: 'calc(100vh - 400px)' } : 
                  { xs: 'calc(100vh - 200px)', sm: 'calc(100vh - 150px)' },
                position: 'relative',
                width: '100%',
                overflowX: 'auto',
                '& .MuiTable-root': {
                  minWidth: filterSold === 'available' ? '100%' : '150%',
                  width: 'max-content',
                },
                '& .MuiTableCell-root': {
                  padding: '4px 6px',
                  fontSize: '0.65rem',
                  borderBottom: '1px solid rgba(224, 224, 224, 1)',
                  whiteSpace: 'normal',
                },
                '& .MuiTableCell-head': {
                  minWidth: 'auto',
                },
                '& .MuiTableCell-root:nth-of-type(1)': { width: '35px' },
                '& .MuiTableCell-root:nth-of-type(2)': { width: '60px' },
                '& .MuiTableCell-root:nth-of-type(3)': { width: '35px' },
                '& .MuiTableCell-root:nth-of-type(4)': { width: '50px' },
                '& .MuiTableCell-root:nth-of-type(5)': { width: '50px' },
                '& .MuiTableCell-root:nth-of-type(6)': { width: '40px' },
                '& .MuiTableCell-root:nth-of-type(7)': { width: '45px' },
                '& .MuiTableCell-root:nth-of-type(8)': { width: '45px' },
                '& .MuiTableCell-root:nth-of-type(9)': { width: '80px' },
                '& .MuiTableCell-root:nth-of-type(10)': { width: '60px' },
                '& .MuiTableCell-root:nth-of-type(11)': { width: '60px' },
                '& .MuiTableCell-root:nth-of-type(12)': { width: '35px' },
                '& .MuiTableCell-root:nth-of-type(13)': { width: '45px' },
                '& .MuiTableCell-root:nth-of-type(14)': { width: '50px' },
                '& .MuiTableCell-root:nth-of-type(15)': { width: '55px' },
                '& .MuiTableCell-root:nth-of-type(16)': { width: '60px' },
                '& .MuiTableCell-root:nth-of-type(17)': { width: '60px' },
                '& .MuiTableCell-root:nth-of-type(18)': { width: '35px' },
                '& .MuiTableCell-root:nth-of-type(19)': { width: '60px' },
                '& .MuiTableCell-root:nth-of-type(20)': { width: '60px' },
                '& .MuiTableCell-root:nth-of-type(21)': { width: '60px' },
                '& .MuiTableCell-root:nth-of-type(22)': { width: '80px' },
                '& .MuiTableCell-root:nth-of-type(23)': { width: '120px' },
              }}
            >
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Table stickyHeader>
                  <TableHead>
                    <TableRow sx={{ 
                      '& th': { 
                        backgroundColor: '#2f4050 !important',
                        color: 'white',
                        fontWeight: 'bold',
                        whiteSpace: 'pre-line',
                        height: '70px',
                        lineHeight: 1.2,
                        padding: '4px 6px',
                        '& .MuiBox-root': {
                          minHeight: '50px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textAlign: 'center',
                          margin: '0 auto',
                          width: '100%'
                        }
                      }
                    }}>
                      {/* Common columns that always show */}
                      <TableCell><Box>{splitHeaderText('Days in Inventory')}</Box></TableCell>
                      <TableCell><Box>{splitHeaderText('Purchase Date')}</Box></TableCell>
                      <TableCell><Box>{splitHeaderText('Year')}</Box></TableCell>
                      <TableCell><Box>{splitHeaderText('Make')}</Box></TableCell>
                      <TableCell><Box>{splitHeaderText('Model')}</Box></TableCell>
                      <TableCell><Box>{splitHeaderText('Trim')}</Box></TableCell>
                      <TableCell><Box>{splitHeaderText('Mileage')}</Box></TableCell>
                      <TableCell><Box>{splitHeaderText('Color')}</Box></TableCell>
                      <TableCell><Box>{splitHeaderText('VIN')}</Box></TableCell>
                      <TableCell><Box>{splitHeaderText('Purchase Price')}</Box></TableCell>
                      <TableCell><Box>{splitHeaderText('Purchase Fund')}</Box></TableCell>
                      <TableCell><Box>{splitHeaderText('Title')}</Box></TableCell>
                      <TableCell><Box>{splitHeaderText('Inspection')}</Box></TableCell>
                      <TableCell><Box>{splitHeaderText('Posted Online')}</Box></TableCell>
                      <TableCell><Box>{splitHeaderText('Reconditioning Cost')}</Box></TableCell>
                      <TableCell><Box>{splitHeaderText('Total Cost')}</Box></TableCell>
                      {(filterSold === 'sold' || filterSold === 'all') && (
                        <TableCell><Box>{splitHeaderText('Purchaser')}</Box></TableCell>
                      )}
                      <TableCell><Box>{splitHeaderText('Pending Issues')}</Box></TableCell>

                      {/* Additional columns for sold/all vehicles */}
                      {(filterSold === 'sold' || filterSold === 'all') && (
                        <>
                          <TableCell><Box>{splitHeaderText('Date Sold')}</Box></TableCell>
                          <TableCell><Box>{splitHeaderText('Sale Price')}</Box></TableCell>
                          <TableCell><Box>{splitHeaderText('Profit')}</Box></TableCell>
                          <TableCell><Box>{splitHeaderText('Closing Statement')}</Box></TableCell>
                        </>
                      )}
                      
                      <TableCell><Box>{splitHeaderText('Actions')}</Box></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredSortedInventory.map((item, index) => {
                      const reconditionCost = reconditioningCosts[item.vin] || 0;
                      const totalCost = item.purchase_price + reconditionCost;
                      const profit = item.sale_status === 'sold' ? item.sale_price - totalCost : 'N/A';

                      return (
                        <TableRow key={item._id} hover sx={{ backgroundColor: index % 2 === 0 ? '#f5f5f5' : 'white' }}>
                          <TableCell className="number-cell">{calculateDaysInInventory(item)}</TableCell>
                          <TableCell className="center-cell">{item.purchase_date}</TableCell>
                          <TableCell className="number-cell">{item.year}</TableCell>
                          <TableCell className="text-cell">{item.make || 'N/A'}</TableCell>
                          <TableCell className="text-cell">{item.model || 'N/A'}</TableCell>
                          <TableCell className="text-cell">{item.trim || 'N/A'}</TableCell>
                          <TableCell className="number-cell">{item.mileage || 'N/A'}</TableCell>
                          <TableCell className="text-cell">{item.color || 'N/A'}</TableCell>
                          <TableCell className="text-cell">{item.vin}</TableCell>
                          <TableCell className="number-cell">{formatPrice(item.purchase_price)}</TableCell>
                          <TableCell className="text-cell">
                            {item.sale_type ? item.sale_type.charAt(0).toUpperCase() + item.sale_type.slice(1) : 'N/A'}
                          </TableCell>                          <TableCell align="center">
                            <Typography
                              variant="body2"
                              sx={{
                                color: item.title_received === true ? '#4caf50' : item.title_received === false ? '#f44336' : 'text.primary',
                                fontSize: filterSold === 'available' ? '0.7rem' : '0.75rem',
                                fontWeight: 'medium'
                              }}
                            >
                              {item.title_received === true ? 'Yes' : item.title_received === false ? 'No' : 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography
                              variant="body2"
                              sx={{
                                color: item.inspection_received === 'no' ? '#f44336' : item.inspection_received === 'yes' ? '#4caf50' : 'text.primary',
                                fontSize: filterSold === 'available' ? '0.7rem' : '0.75rem',
                                fontWeight: 'medium'
                              }}
                            >
                              {item.inspection_received === 'no' ? 'No' : item.inspection_received === 'yes' ? 'Yes' : 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography
                              variant="body2"
                              sx={{
                                color: item.posted_online === 'Posted' ? '#4caf50' : item.posted_online === 'Not Posted' ? '#f44336' : 'text.primary',
                                fontSize: filterSold === 'available' ? '0.7rem' : '0.75rem',
                                fontWeight: 'medium'
                              }}
                            >
                              {item.posted_online || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell className="number-cell">{formatPrice(reconditionCost)}</TableCell>
                          <TableCell className="number-cell">{formatPrice(totalCost)}</TableCell>
                          {(filterSold === 'sold' || filterSold === 'all') && (
                            <TableCell>{item.purchaser || 'N/A'}</TableCell>
                          )}
                          <TableCell>
                            <Tooltip title={item.pending_issues || 'N/A'} arrow>
                              <Typography
                                variant="body2"
                                sx={{
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  maxWidth: '90px',
                                  color: item.pending_issues ? '#f44336' : 'inherit',
                                  fontSize: filterSold === 'available' ? '0.7rem' : '0.75rem',
                                  fontWeight: 'medium'
                                }}
                              >
                                {item.pending_issues || 'N/A'}
                              </Typography>
                            </Tooltip>
                          </TableCell>
                          {(filterSold === 'sold' || filterSold === 'all') && (
                            <>
                              <TableCell>{item.date_sold || 'N/A'}</TableCell>
                              <TableCell>{formatPrice(item.sale_price || 0)}</TableCell>
                              <TableCell>{item.sale_status === 'sold' ? formatPrice(profit) : 'N/A'}</TableCell>
                              <TableCell>
                                <Tooltip title={item.closing_statement || 'N/A'} arrow>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      maxWidth: 200,
                                    }}
                                  >
                                    {item.closing_statement || 'N/A'}
                                  </Typography>
                                </Tooltip>
                              </TableCell>
                            </>
                          )}
                          <TableCell>
                            <Box className="action-buttons" sx={{
                              display: 'flex',
                              gap: 0.5,
                              '& .MuiButton-root': {
                                padding: '2px 8px',
                                fontSize: '0.65rem',
                                minWidth: '50px'
                              }
                            }}>
                              <Button 
                                variant="outlined" 
                                size="small"
                                onClick={() => handleDealCost(item.vin)}
                              >
                                ADD COST
                              </Button>
                              <Button 
                                variant="outlined" 
                                size="small" 
                                onClick={() => handleOpen(item.vin)}
                              >
                                EDIT
                              </Button>
                              <Button
                                variant="outlined"
                                onClick={() => handleDeleteCar(item.vin)}
                                size="small"
                                sx={{ color: '#d32f2f' }}
                              >
                                DEL
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    <TableRow sx={{ backgroundColor: '#e0f7fa', fontWeight: 'bold' }}>
                      <TableCell className="number-cell">
                        {Math.round(filteredSortedInventory.reduce((sum, item) => sum + calculateDaysInInventory(item), 0) / filteredSortedInventory.length || 0)}
                        {' days avg'}
                      </TableCell>
                      <TableCell colSpan={8} />
                      <TableCell className="number-cell" sx={{ fontWeight: 'bold' }}>
                        {formatPrice(filteredSortedInventory.reduce((sum, item) => {
                          const price = parseFloat(item.purchase_price) || 0;
                          return sum + price;
                        }, 0))}
                      </TableCell>
                      <TableCell colSpan={4} />
                      <TableCell className="number-cell" sx={{ fontWeight: 'bold' }}>
                        {formatPrice(filteredSortedInventory.reduce((sum, item) => sum + (reconditioningCosts[item.vin] || 0), 0))}
                      </TableCell>
                      <TableCell className="number-cell" sx={{ fontWeight: 'bold' }}>
                        {formatPrice(filteredSortedInventory.reduce((sum, item) => {
                          const purchasePrice = parseFloat(item.purchase_price) || 0;
                          const reconCost = reconditioningCosts[item.vin] || 0;
                          return sum + purchasePrice + reconCost;
                        }, 0))}
                      </TableCell>
                      {filterSold !== 'available' && (
                        <>
                          <TableCell colSpan={3} />
                          <TableCell className="number-cell" sx={{ fontWeight: 'bold' }}>
                            {formatPrice(filteredSortedInventory.reduce((sum, item) => {
                              const salePrice = parseFloat(item.sale_price) || 0;
                              return sum + salePrice;
                            }, 0))}
                          </TableCell>
                          <TableCell className="number-cell" sx={{ fontWeight: 'bold' }}>
                            {formatPrice(filteredSortedInventory.reduce((sum, item) => {
                              const purchasePrice = parseFloat(item.purchase_price) || 0;
                              const reconCost = reconditioningCosts[item.vin] || 0;
                              const salePrice = parseFloat(item.sale_price) || 0;
                              return sum + (salePrice - (purchasePrice + reconCost));
                            }, 0))}
                          </TableCell>
                          <TableCell colSpan={2} />
                        </>
                      )}
                    </TableRow>
                  </TableBody>
                </Table>
              )}
            </TableContainer>
          </Box>

          <Box 
            mt={2} 
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              p: 2,
              borderRadius: 2,
              background: theme => `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Total Vehicles: {filteredSortedInventory.length}
            </Typography>
          </Box>

          <Modal open={open} onClose={handleClose}>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: { xs: '95%', sm: '600px' },
                maxHeight: { xs: '90vh', sm: '80vh' },
                overflow: 'auto',
                bgcolor: 'background.paper',
                borderRadius: '10px',
                boxShadow: 24,
                p: { xs: 2, sm: 3 }
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

          {filterSold === 'sold' && (
            <Paper
              elevation={0}
              sx={{
                mt: 3,
                p: 3,
                borderRadius: 3,
                background: theme.palette.mode === 'dark' 
                  ? 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)'
                  : 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(245,245,245,1) 100%)',
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 4px 20px 0 rgba(0,0,0,0.2)'
                  : '0 4px 20px 0 rgba(0,0,0,0.05)',
                border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                Profit Metrics
              </Typography>

              <Grid container spacing={3}>
                {/* Average Profit Per Car */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                      Average Profit Per Car
                    </Typography>
                    <Typography variant="h4" color="primary">
                      {formatPrice(calculateAverageProfitPerCar(filteredSortedInventory, reports, reconditioningCosts))}
                    </Typography>
                  </Box>
                </Grid>

                {/* Average Profit by Purchaser */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    Average Profit by Purchaser
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Purchaser</TableCell>
                          <TableCell align="right">Avg. Profit</TableCell>
                          <TableCell align="right"># of Cars</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {calculateAverageProfitByPurchaser(filteredSortedInventory, reports, reconditioningCosts)
                          .sort((a, b) => b.averageProfit - a.averageProfit)
                          .map((row) => (
                            <TableRow key={row.purchaser}>
                              <TableCell>{row.purchaser}</TableCell>
                              <TableCell align="right" sx={{
                                color: row.averageProfit >= 0 ? 'success.main' : 'error.main',
                                fontWeight: 'medium'
                              }}>
                                {formatPrice(row.averageProfit)}
                              </TableCell>
                              <TableCell align="right">{row.numberOfCars}</TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </Paper>
          )}

        </Box>
      </Container>
    </motion.div>
  );
}

export default Inventory;