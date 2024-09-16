import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function AddExpenseReport() {
    const navigate = useNavigate();

    const handleScanCopy = () => {
        // Implement functionality for scanning a copy, e.g., navigate to a scan page or open scanner
        console.log('Scan Copy button clicked');
        // Example: navigate('/scan-copy');
    };

    const handleEnterDetailsManually = () => {
        // Implement functionality for entering details manually
        console.log('Enter Details Manually button clicked');
        // Example: navigate('/enter-details');
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
                    onClick={() => navigate('/enter-details-manually')}
                >
                    Enter Details Manually
                </Button>

            </Box>
        </Container>
    );
}

export default AddExpenseReport;