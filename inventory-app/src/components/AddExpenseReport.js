import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

function AddExpenseReport() {
    const navigate = useNavigate();
    const location = useLocation(); // Get the state passed when navigating from Inventory

    const { vin } = location.state || {}; // Extract the VIN from the state, if passed

    const handleScanCopy = () => {
        // Implement functionality for scanning a copy, e.g., navigate to a scan page or open scanner
        console.log('Scan Copy button clicked');
        // Example: navigate('/scan-copy');
    };

    const handleEnterDetailsManually = () => {
        // Navigate to the "Enter Details Manually" page and pass the VIN
        navigate('/enter-details-manually', { state: { vin } });
    };

    return (
        <Container maxWidth="sm">
            <Box mt={5} textAlign="center">
                <Typography variant="h4" gutterBottom>
                    Add Expense Report
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleScanCopy}
                    sx={{ m: 2 }}
                >
                    Scan Copy
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleEnterDetailsManually}
                >
                    Enter Details Manually
                </Button>
            </Box>
        </Container>
    );
}

export default AddExpenseReport;